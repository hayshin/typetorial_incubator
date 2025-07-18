import { Container, Graphics } from "pixi.js";
import { GameConstants } from "../data/GameConstants";

/**
 * Progress bar component showing game progress across all levels
 * Has many small increments that fill based on completed words/messages
 */
export class ProgressBar extends Container {
  /** Array of small increment graphics */
  private increments: Graphics[] = [];

  /** Background graphics */
  private background: Graphics;

  /** Level separator lines */
  private levelSeparators: Graphics[] = [];

  /** Progress bar width */
  private readonly PROGRESS_BAR_WIDTH = 800;

  /** Progress bar height */
  private readonly PROGRESS_BAR_HEIGHT = 20;

  /** Number of small increments */
  private readonly INCREMENT_COUNT = 100;

  /** Width of each increment */
  private readonly INCREMENT_WIDTH =
    this.PROGRESS_BAR_WIDTH / this.INCREMENT_COUNT;

  /** Gap between increments */
  private readonly INCREMENT_GAP = 1;

  /** Level boundaries (30% for level 1, 70% for level 2, 100% for level 3) */
  private readonly LEVEL_BOUNDARIES = [0.3, 0.7, 1.0];

  constructor() {
    super();

    this.createBackground();
    this.createIncrements();
    this.createLevelSeparators();
    this.updateProgress(1, 0, 1); // Initialize with default values
  }

  /**
   * Create background for the progress bar
   */
  private createBackground(): void {
    this.background = new Graphics();
    this.background.rect(
      -this.PROGRESS_BAR_WIDTH / 2,
      -this.PROGRESS_BAR_HEIGHT / 2,
      this.PROGRESS_BAR_WIDTH,
      this.PROGRESS_BAR_HEIGHT,
    );
    this.background.fill(0x333333);
    this.background.stroke({ color: 0x666666, width: 2 });
    this.addChild(this.background);
  }

  /**
   * Create individual small increments
   */
  private createIncrements(): void {
    for (let i = 0; i < this.INCREMENT_COUNT; i++) {
      const increment = new Graphics();

      const incrementX =
        -this.PROGRESS_BAR_WIDTH / 2 +
        i * this.INCREMENT_WIDTH +
        this.INCREMENT_GAP;
      const incrementWidth = this.INCREMENT_WIDTH - this.INCREMENT_GAP * 2;
      const incrementY = -this.PROGRESS_BAR_HEIGHT / 2 + this.INCREMENT_GAP;
      const incrementHeight = this.PROGRESS_BAR_HEIGHT - this.INCREMENT_GAP * 2;

      increment.rect(incrementX, incrementY, incrementWidth, incrementHeight);

      // Determine color based on which level this increment belongs to
      const progress = i / this.INCREMENT_COUNT;
      let incrementColor = 0x00aa00; // Green for level 1
      if (progress >= 0.3 && progress < 0.7) incrementColor = 0x0088ff; // Blue for level 2
      if (progress >= 0.7) incrementColor = 0xff6600; // Orange for level 3

      increment.fill(incrementColor);
      increment.alpha = 0.2; // Start very dimmed

      this.increments.push(increment);
      this.addChild(increment);
    }
  }

  /**
   * Create level separator lines
   */
  private createLevelSeparators(): void {
    for (let i = 0; i < this.LEVEL_BOUNDARIES.length - 1; i++) {
      const separator = new Graphics();
      const x =
        -this.PROGRESS_BAR_WIDTH / 2 +
        this.LEVEL_BOUNDARIES[i] * this.PROGRESS_BAR_WIDTH;

      separator.rect(
        x - 1,
        -this.PROGRESS_BAR_HEIGHT / 2,
        2,
        this.PROGRESS_BAR_HEIGHT,
      );
      separator.fill(0xffffff);
      separator.alpha = 0.8;

      this.levelSeparators.push(separator);
      this.addChild(separator);
    }
  }

  /**
   * Update progress bar based on current level and remaining items
   */
  public updateProgress(
    currentLevel: 1 | 2 | 3,
    remainingItems: number,
    totalItems: number,
  ): void {
    const completedItems = totalItems - remainingItems;
    this.updateProgressByItems(currentLevel, completedItems, totalItems);
  }

  /**
   * Update progress bar with typing text progress for level 3
   */
  public updateProgressWithTypingProgress(
    typingProgress: number,
    typedWords: number,
    totalWords: number,
  ): void {
    this.updateProgressByItems(3, typedWords, totalWords);
  }

  /**
   * Update progress based on completed items for any level
   */
  private updateProgressByItems(
    currentLevel: 1 | 2 | 3,
    completedItems: number,
    totalItems: number,
  ): void {
    // Calculate progress boundaries for each level
    let levelStart = 0;
    let levelEnd = 0;

    if (currentLevel === 1) {
      levelStart = 0;
      levelEnd = 0.3;
    } else if (currentLevel === 2) {
      levelStart = 0.3;
      levelEnd = 0.7;
    } else if (currentLevel === 3) {
      levelStart = 0.7;
      levelEnd = 1.0;
    }

    // Calculate progress within current level
    const levelProgress = totalItems > 0 ? completedItems / totalItems : 0;
    const overallProgress =
      levelStart + levelProgress * (levelEnd - levelStart);

    this.updateIncrementVisuals(overallProgress);
  }

  /**
   * Update visual appearance of increments
   */
  private updateIncrementVisuals(overallProgress: number): void {
    const filledIncrements = Math.floor(overallProgress * this.INCREMENT_COUNT);

    for (let i = 0; i < this.INCREMENT_COUNT; i++) {
      const increment = this.increments[i];

      if (i < filledIncrements) {
        // Fully filled increment
        increment.alpha = 1.0;
      } else if (i === filledIncrements) {
        // Partially filled increment
        const partialProgress = (overallProgress * this.INCREMENT_COUNT) % 1;
        increment.alpha = 0.2 + 0.8 * partialProgress;
      } else {
        // Empty increment
        increment.alpha = 0.2;
      }
    }
  }

  /**
   * Get current progress (0-1)
   */
  public getProgress(): number {
    // Calculate from visible increments
    let filledCount = 0;
    for (const increment of this.increments) {
      if (increment.alpha > 0.5) filledCount++;
    }
    return filledCount / this.INCREMENT_COUNT;
  }

  /**
   * Reset progress bar
   */
  public reset(): void {
    for (const increment of this.increments) {
      increment.alpha = 0.2;
    }
  }

  /**
   * Position the progress bar on screen
   */
  public resize(width: number, height: number): void {
    this.x = width * 0.5;
    this.y = height - 50; // 50px from bottom
  }

  /**
   * Get increment count
   */
  public getIncrementCount(): number {
    return this.INCREMENT_COUNT;
  }

  /**
   * Get current level based on progress
   */
  public getCurrentLevelFromProgress(): 1 | 2 | 3 {
    const progress = this.getProgress();
    if (progress < 0.3) return 1;
    if (progress < 0.7) return 2;
    return 3;
  }

  /**
   * Show progress bar with animation
   */
  public show(): void {
    this.alpha = 0;
    // Simple fade in (can be enhanced with motion library if needed)
    const fadeIn = () => {
      this.alpha = Math.min(1, this.alpha + 0.05);
      if (this.alpha < 1) {
        requestAnimationFrame(fadeIn);
      }
    };
    fadeIn();
  }

  /**
   * Hide progress bar with animation
   */
  public hide(): void {
    const fadeOut = () => {
      this.alpha = Math.max(0, this.alpha - 0.05);
      if (this.alpha > 0) {
        requestAnimationFrame(fadeOut);
      }
    };
    fadeOut();
  }
}
