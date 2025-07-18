import { Container } from "pixi.js";
import { GameConstants } from "../data/GameConstants";
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

  /** Whether the current character is wrong */
  private hasWrongCharacter: boolean = false;

  constructor(text: string, speed?: number, author?: string) {
    // constructor(text: string, speed?: number) {
    super();

    console.log("Word - constructor called with:", { text, speed, author });
    this.targetText = text;
    this.speed = speed || GameConstants.WORD_SPEED;

    // Set random angle for movement (between -30 and 30 degrees)
    const angle = ((Math.random() - 0.5) * Math.PI) / 3; // -π/6 to π/6 radians
    this.velocityX = -this.speed * Math.cos(angle); // Negative for leftward movement
    this.velocityY = this.speed * Math.sin(angle);

    // Create message bubble with sender name and word as message
    this.messageBubble = new MessageBubble(author || "игрок", this.targetText, {
      maxWidth: GameConstants.MESSAGE_MAX_WIDTH,
      messageSize: 20,
      senderNameSize: 20,
    });

    // Center the bubble by positioning it
    this.messageBubble.x = -this.messageBubble.bubbleWidth * 0.5;
    this.messageBubble.y = -this.messageBubble.bubbleHeight * 0.5;

    this.addChild(this.messageBubble);

    // Start from right side of screen
    this.x = GameConstants.WORD_SPAWN_X;
    this.y = this.getRandomSpawnY();

    console.log("Word - created and positioned at:", this.x, this.y);

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
    const typedChar = char;

    if (typedChar === expectedChar) {
      this.typedProgress++;
      this.hasWrongCharacter = false;
      this.updateMessageDisplay();

      // Check if word is completed
      if (this.typedProgress >= this.targetText.length) {
        this.complete();
      }

      return true;
    } else {
      // Wrong character - show error state
      this.hasWrongCharacter = true;
      this.updateMessageDisplay();
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
      // Bring this word to front so it's visible above all others
      this.bringToFront();
      // Slightly scale up when active and make fully opaque
      this.scale.set(1.1, 1.1);
      // this.alpha = 1.0;
    } else {
      // Return to normal state with slightly reduced opacity
      this.scale.set(1, 1);
      // this.alpha = 0.8;
    }
  }

  /**
   * Bring this word to the front (top layer) above all other words
   */
  public bringToFront(): void {
    if (this.parent) {
      // Remove from current position and add back at the end
      // This ensures it's on the topmost layer
      const parent = this.parent;
      parent.removeChild(this);
      parent.addChild(this);
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
      this.hasWrongCharacter = false;
      this.updateMessageDisplay();
    }, 100);
  }

  /**
   * Update message display to show typing progress
   */
  private updateMessageDisplay(): void {
    // Get typed portion of the text
    const typedText = this.targetText.slice(0, this.typedProgress);

    // Use the new method with typing progress and error highlighting
    this.messageBubble.setMessageWithTypingProgress(
      this.targetText,
      typedText,
      this.hasWrongCharacter,
    );
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
    return this.targetText.startsWith(input);
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
