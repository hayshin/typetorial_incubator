import { animate } from "motion";
import { Container, HTMLText } from "pixi.js";
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

  /** Single text display with HTML markup for different colors */
  private textDisplay: HTMLText;

  /** Movement speed in pixels per second */
  private speed: number;

  /** Velocity components for angled movement */
  private velocityX: number;
  private velocityY: number;

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

    // Set random angle for movement (between -30 and 30 degrees)
    const angle = ((Math.random() - 0.5) * Math.PI) / 3; // -π/6 to π/6 radians
    this.velocityX = -this.speed * Math.cos(angle); // Negative for leftward movement
    this.velocityY = this.speed * Math.sin(angle);

    // Create single text display with HTML markup support
    this.textDisplay = new HTMLText({
      text: this.targetText,
      style: {
        fontFamily: "Arial",
        fontSize: GameConstants.MESSAGE_FONT_SIZE,
        fill: GameConstants.TYPING_DEFAULT_COLOR,
        fontWeight: "bold",
        wordWrap: true,
        wordWrapWidth: GameConstants.MESSAGE_MAX_WIDTH,
      },
    });
    this.textDisplay.anchor.set(0.5, 0.5); // Center the text

    this.addChild(this.textDisplay);

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

    // Move based on velocity
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;

    // Check top and bottom bounds and bounce
    const gameHeight = GameConstants.GAME_HEIGHT;

    if (this.y < -gameHeight / 2) {
      this.y = -gameHeight / 2;
      this.velocityY = -this.velocityY; // Bounce back
    }
    if (this.y > gameHeight / 2) {
      this.y = gameHeight / 2;
      this.velocityY = -this.velocityY; // Bounce back
    }

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
    // Flash red on the entire text
    const originalColor = this.textDisplay.style.fill;
    this.textDisplay.style.fill = GameConstants.TYPING_ERROR_COLOR;

    animate(this.scale, { x: 0.9, y: 0.9 }, { duration: 0.1 }).then(() => {
      animate(this.scale, { x: 1, y: 1 }, { duration: 0.1 });
      this.textDisplay.style.fill = originalColor;
      this.updateTextDisplay(); // Restore proper colors
    });
  }

  /**
   * Update text display to show typing progress
   */
  private updateTextDisplay(): void {
    const typedPart = this.targetText.slice(0, this.typedProgress);
    const remainingPart = this.targetText.slice(this.typedProgress);

    // Create HTML markup with different colors
    let htmlText = "";
    if (typedPart) {
      htmlText += `<span style="color: #888888">${typedPart}</span>`;
    }
    if (remainingPart) {
      htmlText += `<span style="color: #ffffff">${remainingPart}</span>`;
    }

    this.textDisplay.text = htmlText || this.targetText;
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
