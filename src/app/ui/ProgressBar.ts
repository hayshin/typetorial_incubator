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

  /** Level boundaries (33.33% for each level) */
  private readonly LEVEL_BOUNDARIES = [0.3333, 0.6666, 1.0];

  /** Progress tracking for each level (0-1 for each level) */
  private levelProgress: [number, number, number] = [0, 0, 0];

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
      if (
        progress >= this.LEVEL_BOUNDARIES[0] &&
        progress < this.LEVEL_BOUNDARIES[1]
      )
        incrementColor = 0x0088ff; // Blue for level 2
      if (progress >= this.LEVEL_BOUNDARIES[1]) incrementColor = 0xff6600; // Orange for level 3

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
    const levelProgressValue = totalItems > 0 ? completedItems / totalItems : 0;
    this.setLevelProgress(currentLevel, levelProgressValue);
  }

  /**
   * Update progress bar with typing text progress for level 3
   */
  public updateProgressWithTypingProgress(
    typingProgress: number,
    typedWords: number,
    totalWords: number,
  ): void {
    const levelProgressValue = totalWords > 0 ? typedWords / totalWords : 0;
    this.setLevelProgress(3, levelProgressValue);
  }

  /**
   * Set progress for a specific level
   */
  public setLevelProgress(level: 1 | 2 | 3, progress: number): void {
    // Clamp progress between 0 and 1
    progress = Math.max(0, Math.min(1, progress));

    // Update the specific level progress
    this.levelProgress[level - 1] = progress;

    // Update visual representation
    this.updateIncrementVisualsFromLevelProgress();
  }

  /**
   * Mark a level as completed
   */
  public completeLevelProgress(level: 1 | 2 | 3): void {
    this.setLevelProgress(level, 1.0);
  }

  /**
   * Update visual appearance of increments based on level progress
   */
  private updateIncrementVisualsFromLevelProgress(): void {
    for (let i = 0; i < this.INCREMENT_COUNT; i++) {
      const increment = this.increments[i];
      const globalProgress = i / this.INCREMENT_COUNT;

      // Determine which level this increment belongs to
      let currentLevel: 1 | 2 | 3;
      let levelStart: number;
      let levelEnd: number;

      if (globalProgress < this.LEVEL_BOUNDARIES[0]) {
        currentLevel = 1;
        levelStart = 0;
        levelEnd = this.LEVEL_BOUNDARIES[0];
      } else if (globalProgress < this.LEVEL_BOUNDARIES[1]) {
        currentLevel = 2;
        levelStart = this.LEVEL_BOUNDARIES[0];
        levelEnd = this.LEVEL_BOUNDARIES[1];
      } else {
        currentLevel = 3;
        levelStart = this.LEVEL_BOUNDARIES[1];
        levelEnd = this.LEVEL_BOUNDARIES[2];
      }

      // Calculate position within the level segment
      const positionInLevel =
        (globalProgress - levelStart) / (levelEnd - levelStart);
      const levelProgressValue = this.levelProgress[currentLevel - 1];

      // Set alpha based on level progress
      if (positionInLevel <= levelProgressValue) {
        increment.alpha = 1.0; // Filled
      } else {
        // Check if this is the next increment to be filled (partial fill)
        const nextPosition =
          ((i + 1) / this.INCREMENT_COUNT - levelStart) /
          (levelEnd - levelStart);
        if (
          positionInLevel <=
          levelProgressValue +
            1 / this.INCREMENT_COUNT / (levelEnd - levelStart)
        ) {
          const partialProgress =
            (levelProgressValue - positionInLevel) /
            (1 / this.INCREMENT_COUNT / (levelEnd - levelStart));
          increment.alpha = Math.max(0.2, 0.2 + 0.8 * partialProgress);
        } else {
          increment.alpha = 0.2; // Empty
        }
      }
    }
  }

  /**
   * Get progress for a specific level
   */
  public getLevelProgress(level: 1 | 2 | 3): number {
    return this.levelProgress[level - 1];
  }

  /**
   * Check if a level is completed
   */
  public isLevelCompleted(level: 1 | 2 | 3): boolean {
    return this.levelProgress[level - 1] >= 1.0;
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
    this.levelProgress = [0, 0, 0];
    for (const increment of this.increments) {
      increment.alpha = 0.2;
    }
  }

  /**
   * Reset progress for a specific level
   */
  public resetLevel(level: 1 | 2 | 3): void {
    this.levelProgress[level - 1] = 0;
    this.updateIncrementVisualsFromLevelProgress();
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
    // Return the highest incomplete level, or 3 if all are complete
    if (!this.isLevelCompleted(1)) return 1;
    if (!this.isLevelCompleted(2)) return 2;
    return 3;
  }

  /**
   * Get overall completion percentage (0-1)
   */
  public getOverallProgress(): number {
    return (
      (this.levelProgress[0] + this.levelProgress[1] + this.levelProgress[2]) /
      3
    );
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
