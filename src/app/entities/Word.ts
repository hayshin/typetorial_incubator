import { Container } from "pixi.js";
import { GameConstants } from "../data/GameConstants";
import { GameState } from "../core/GameState";
import { MessageBubble } from "../ui/MessageBubble";

/**
 * Represents a flying word that moves from right to left
 * Players need to type this word to destroy it
 */
export class Word extends Container {
  /** The word text that needs to be typed */
  public readonly targetText: string;

  /** Current progress of typing (how many characters typed correctly) */
  public typedProgress: number = 0;

  /** Message bubble display */
  private messageBubble: MessageBubble;

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

  /** Direction multiplier for movement (1 = right, -1 = left) */
  private directionMultiplier: number = -1;

  /** Whether this is a player message (moves right) */
  private isPlayerMessage: boolean = false;

  constructor(text: string, speed?: number, author?: string) {
    // constructor(text: string, speed?: number) {
    super();

    this.targetText = text.toLowerCase();
    this.speed = speed || GameConstants.WORD_SPEED;

    // Set random angle for movement (between -30 and 30 degrees)
    const angle = ((Math.random() - 0.5) * Math.PI) / 3; // -π/6 to π/6 radians
    this.velocityX = -this.speed * Math.cos(angle); // Negative for leftward movement
    this.velocityY = this.speed * Math.sin(angle);

    // Create message bubble with sender name and word as message
    this.messageBubble = new MessageBubble(
      author || "Mentor",
      this.targetText,
      {
        maxWidth: GameConstants.MESSAGE_MAX_WIDTH,
        messageSize: 20,
        senderNameSize: 20,
        level: GameState.getCurrentLevel(), // Pass current level
        author: author || "Mentor", // Pass author for styling
      },
    );

    // Center the bubble by positioning it
    this.messageBubble.x = -this.messageBubble.bubbleWidth * 0.5;
    this.messageBubble.y = -this.messageBubble.bubbleHeight * 0.5;

    this.addChild(this.messageBubble);

    // Start from right side of screen
    this.x = GameConstants.WORD_SPAWN_X;
    this.y = this.getRandomSpawnY();

    // Fade in animation
    this.alpha = 0;
    setTimeout(() => {
      this.alpha = 1;
    }, GameConstants.FADE_IN_DURATION * 1000);
  }

  /**
   * Set movement direction (1 = right, -1 = left)
   */
  public setDirection(direction: 1 | -1): void {
    this.directionMultiplier = direction;
    this.isPlayerMessage = direction === 1; // Player messages move right
    // Update velocity to match new direction
    const angle = ((Math.random() - 0.5) * Math.PI) / 3;
    this.velocityX = this.directionMultiplier * this.speed * Math.cos(angle);
    this.velocityY = this.speed * Math.sin(angle);
  }

  /**
   * Check if this is a player message
   */
  public isPlayerWord(): boolean {
    return this.isPlayerMessage;
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

    // Check if reached edge (depends on direction)
    if (this.directionMultiplier < 0) {
      // Moving left - check left edge
      if (this.x < GameConstants.WORD_DESTROY_X) {
        this.hasReachedEdge = true;
      }
    } else {
      // Moving right - check right edge
      if (this.x > GameConstants.WORD_SPAWN_X) {
        this.hasReachedEdge = true;
      }
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
      this.updateMessageDisplay();

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
      this.scale.set(1.1, 1.1);
    } else {
      // Return to normal state
      this.scale.set(1, 1);
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
    this.scale.set(1.5, 1.5);
    setTimeout(() => {
      this.alpha = 0;
    }, GameConstants.WORD_DESTROY_ANIMATION * 1000);
  }

  /**
   * Show error state when wrong character is typed
   */
  private showError(): void {
    // Flash red by temporarily changing the message bubble colors
    const originalBgColor = this.messageBubble.background.tint;
    this.messageBubble.background.tint = 0xff0000;

    this.scale.set(0.9, 0.9);
    setTimeout(() => {
      this.scale.set(1, 1);
      this.messageBubble.background.tint = originalBgColor;
    }, 100);
  }

  /**
   * Update message display to show typing progress
   */
  private updateMessageDisplay(): void {
    // Show typing progress by removing typed characters while keeping bubble size
    this.messageBubble.setMessageWithProgress(this.targetText, this.typedProgress);
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
    this.updateMessageDisplay();
  }

  /**
   * Destroy the word with animation
   */
  public async destroy(): Promise<void> {
    this.alpha = 0;

    if (this.parent) {
      this.parent.removeChild(this);
    }
  }
}
