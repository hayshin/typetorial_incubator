import { animate } from "motion";
import { Container, Text } from "pixi.js";
import { GameConstants } from "../data/GameConstants";

/**
 * Represents a flying word that moves from right to left
 * Players need to type this word to destroy it
 */
export class Word extends Container {
  /** The word text that needs to be typed */
  public readonly targetText: string;

  /** Current progress of typing (how many characters typed correctly) */
  public typedProgress: number = 0;

  /** Text display for typed characters (gray) */
  private typedTextDisplay: Text;

  /** Text display for remaining characters (white) */
  private remainingTextDisplay: Text;

  /** Movement speed in pixels per second */
  private speed: number;

  /** Whether this word is currently being typed */
  public isActive: boolean = false;

  /** Whether this word has been completed */
  public isCompleted: boolean = false;

  /** Whether this word has reached the left edge */
  public hasReachedEdge: boolean = false;

  constructor(text: string, speed?: number) {
    super();

    this.targetText = text.toLowerCase();
    this.speed = speed || GameConstants.WORD_SPEED;

    // Create text display for typed characters (initially empty)
    this.typedTextDisplay = new Text({
      text: "",
      style: {
        fontFamily: "Arial",
        fontSize: 32,
        fill: 0x888888, // Gray color for typed text
        fontWeight: "bold",
      },
    });
    this.typedTextDisplay.anchor.set(0, 0.5);

    // Create text display for remaining characters
    this.remainingTextDisplay = new Text({
      text: this.targetText,
      style: {
        fontFamily: "Arial",
        fontSize: 32,
        fill: GameConstants.TYPING_DEFAULT_COLOR,
        fontWeight: "bold",
      },
    });
    this.remainingTextDisplay.anchor.set(0, 0.5);

    this.addChild(this.typedTextDisplay);
    this.addChild(this.remainingTextDisplay);

    // Position texts correctly
    this.updateTextPositions();

    // Start from right side of screen
    this.x = GameConstants.WORD_SPAWN_X;
    this.y = this.getRandomSpawnY();

    // Fade in animation
    this.alpha = 0;
    animate(this, { alpha: 1 }, { duration: GameConstants.FADE_IN_DURATION });
  }

  /**
   * Update word position and check bounds
   */
  public update(deltaTime: number): void {
    if (this.isCompleted) return;

    // Move left
    this.x -= this.speed * deltaTime;

    // Check if reached left edge
    if (this.x < GameConstants.WORD_DESTROY_X) {
      this.hasReachedEdge = true;
    }
  }

  /**
   * Try to type a character. Returns true if character was correct
   */
  public typeCharacter(char: string): boolean {
    if (this.isCompleted || !this.isActive) return false;

    const expectedChar = this.targetText[this.typedProgress];
    const typedChar = char.toLowerCase();

    if (typedChar === expectedChar) {
      this.typedProgress++;
      this.updateTextDisplay();

      // Check if word is completed
      if (this.typedProgress >= this.targetText.length) {
        this.complete();
      }

      return true;
    } else {
      // Wrong character - show error state
      this.showError();
      return false;
    }
  }

  /**
   * Set this word as the active target for typing
   */
  public setActive(active: boolean): void {
    this.isActive = active;

    if (active) {
      // Slightly scale up when active, but don't change color
      animate(this.scale, { x: 1.1, y: 1.1 }, { duration: 0.1 });
    } else {
      // Return to normal state
      animate(this.scale, { x: 1, y: 1 }, { duration: 0.1 });
    }
  }

  /**
   * Get remaining characters to type
   */
  public getRemainingText(): string {
    return this.targetText.slice(this.typedProgress);
  }

  /**
   * Get typed characters
   */
  public getTypedText(): string {
    return this.targetText.slice(0, this.typedProgress);
  }

  /**
   * Mark word as completed and start destroy animation
   */
  private complete(): void {
    this.isCompleted = true;
    this.isActive = false;

    // Completion animation
    animate(
      this,
      { alpha: 0, scale: { x: 1.5, y: 1.5 } },
      {
        duration: GameConstants.WORD_DESTROY_ANIMATION,
        ease: "backOut",
      },
    );
  }

  /**
   * Show error state when wrong character is typed
   */
  private showError(): void {
    // Flash red on remaining text only
    const originalColor = this.remainingTextDisplay.style.fill;
    this.remainingTextDisplay.style.fill = GameConstants.TYPING_ERROR_COLOR;

    animate(this.scale, { x: 0.9, y: 0.9 }, { duration: 0.1 }).then(() => {
      animate(this.scale, { x: 1, y: 1 }, { duration: 0.1 });
      this.remainingTextDisplay.style.fill = originalColor;
    });
  }

  /**
   * Update text display to show typing progress
   */
  private updateTextDisplay(): void {
    const typedPart = this.targetText.slice(0, this.typedProgress);
    const remainingPart = this.targetText.slice(this.typedProgress);

    // Update text content
    this.typedTextDisplay.text = typedPart;
    this.remainingTextDisplay.text = remainingPart;

    // Update positions
    this.updateTextPositions();
  }

  /**
   * Update positions of text displays to align properly
   */
  private updateTextPositions(): void {
    // Calculate total width to center the word
    const typedWidth = this.typedTextDisplay.width;
    const remainingWidth = this.remainingTextDisplay.width;
    const totalWidth = typedWidth + remainingWidth;

    // Center the entire word
    const startX = -totalWidth / 2;

    // Position typed text
    this.typedTextDisplay.x = startX;

    // Position remaining text right after typed text
    this.remainingTextDisplay.x = startX + typedWidth;
  }

  /**
   * Get random Y position for spawning
   */
  private getRandomSpawnY(): number {
    const { min, max } = GameConstants.WORD_SPAWN_Y_RANGE;
    return Math.random() * (max - min) + min;
  }

  /**
   * Get the next character that needs to be typed
   */
  public getNextCharacter(): string | null {
    if (this.typedProgress >= this.targetText.length) return null;
    return this.targetText[this.typedProgress];
  }

  /**
   * Check if this word matches the start of given input
   */
  public matchesInput(input: string): boolean {
    return this.targetText.startsWith(input.toLowerCase());
  }

  /**
   * Reset typing progress (useful for restarting)
   */
  public resetProgress(): void {
    this.typedProgress = 0;
    this.isCompleted = false;
    this.hasReachedEdge = false;
    this.updateTextDisplay();
  }

  /**
   * Destroy the word with animation
   */
  public async destroy(): Promise<void> {
    await animate(
      this,
      { alpha: 0 },
      {
        duration: GameConstants.FADE_OUT_DURATION,
      },
    );

    if (this.parent) {
      this.parent.removeChild(this);
    }
  }
}
