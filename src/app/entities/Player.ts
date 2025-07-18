import { animate } from "motion";
import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { GameConstants } from "../data/GameConstants";
import { Bullet } from "./Bullet";
import type { Word } from "./Word";

/**
 * Represents the player character that shoots bullets at words
 */
export class Player extends Container {
  /** Player's visual representation */
  private playerDefaultSprite!: Sprite;
  private playerKeyboardSprite!: Sprite;

  /** Array of active bullets */
  private bullets: Bullet[] = [];

  /** Container for bullets */
  private bulletContainer: Container;

  /** Current target word */
  private currentTarget: Word | null = null;

  /** Player's position on the left side of the screen */
  private playerX: number;
  private playerY: number;

  /** Player size */
  private playerSize: number = 400; // Increased for image sprites

  /** Animation state */
  private isAnimating: boolean = false;

  /** Array of heart sprites for lives */
  private hearts: Graphics[] = [];

  /** Current lives */
  private currentLives: number = 3;

  /** Maximum lives */
  private maxLives: number = 3;

  /** Whether player is defeated */
  public isDefeated: boolean = false;

  /** Callback when player is defeated */
  public onDefeated?: () => void;

  /** Callback when player takes damage */
  public onTakeDamage?: () => void;

  constructor() {
    super();

    // Set player position (middle of left edge)
    this.playerX = GameConstants.PLAYER_X;
    this.playerY = 0; // Middle of screen

    // Create bullet container
    this.bulletContainer = new Container();
    this.addChild(this.bulletContainer);

    // Create player graphics
    this.createPlayerGraphics();

    // Create hearts display
    this.createHeartsDisplay();

    // Position player
    this.x = this.playerX;
    this.y = this.playerY;
  }

  /**
   * Create player's visual representation
   */
  private createPlayerGraphics(): void {
    // Create default state sprite
    this.playerDefaultSprite = new Sprite(Texture.from("main/player/0.PNG"));
    this.playerDefaultSprite.anchor.set(0.5, 1);
    this.playerDefaultSprite.width = this.playerSize;
    this.playerDefaultSprite.height = this.playerSize;

    // Create keyboard state sprite
    this.playerKeyboardSprite = new Sprite(Texture.from("main/player/1.PNG"));
    this.playerKeyboardSprite.anchor.set(0.5, 0.5);
    this.playerKeyboardSprite.width = this.playerSize;
    this.playerKeyboardSprite.height = this.playerSize;
    this.playerKeyboardSprite.visible = false;

    this.addChild(this.playerDefaultSprite);
    this.addChild(this.playerKeyboardSprite);
  }

  /**
   * Create hearts display for lives
   */
  private createHeartsDisplay(): void {
    const heartSize = 30;
    const heartSpacing = 35;
    const startX = (-(this.maxLives - 1) * heartSpacing) / 2;

    for (let i = 0; i < this.maxLives; i++) {
      const heart = this.createHeart(heartSize);
      heart.x = startX + i * heartSpacing;
      heart.y = -this.playerSize - 50;
      this.hearts.push(heart);
      this.addChild(heart);
    }

    this.updateHeartsDisplay();
  }

  /**
   * Create a heart shape using Graphics
   */
  private createHeart(size: number): Graphics {
    const heart = new Graphics();
    const scale = size / 30; // Base size of 30

    // Draw heart shape
    heart.moveTo(0, -5 * scale);
    heart.bezierCurveTo(
      -7.5 * scale,
      -12.5 * scale,
      -20 * scale,
      -7.5 * scale,
      0,
      5 * scale,
    );
    heart.bezierCurveTo(
      20 * scale,
      -7.5 * scale,
      7.5 * scale,
      -12.5 * scale,
      0,
      -5 * scale,
    );
    heart.fill(0xff0000); // Red color

    return heart;
  }

  /**
   * Set the current target word
   */
  public setTarget(word: Word | null): void {
    this.currentTarget = word;
  }

  /**
   * Get the current target word
   */
  public getCurrentTarget(): Word | null {
    return this.currentTarget;
  }

  /**
   * Shoot a bullet towards the current target
   */
  public shootBullet(): void {
    if (!this.currentTarget) {
      console.log("No target to shoot at");
      return;
    }

    // Create bullet
    const bullet = new Bullet();

    // Set bullet start position (from player center, using local coordinates)
    const startX = this.x + this.playerSize * 0.3; // Adjust for image sprite
    const startY = this.y;

    bullet.x = startX;
    bullet.y = startY;

    // Set bullet target
    bullet.setTarget(this.currentTarget);

    // Add bullet to the same container as the player (parent container)
    if (this.parent) {
      this.parent.addChild(bullet);
    }
    this.bullets.push(bullet);

    // Play shooting animation
    this.playShootAnimation();
  }

  /**
   * Play shooting animation
   */
  private playShootAnimation(): void {
    if (this.isAnimating) return;

    this.isAnimating = true;

    // Switch to keyboard state
    this.setKeyboardState(true);

    // Quick scale animation
    const originalScale = { x: this.scale.x, y: this.scale.y };

    animate(this.scale, { x: 1.1, y: 1.1 }, { duration: 0.1 }).then(() => {
      animate(this.scale, originalScale, { duration: 0.1 }).then(() => {
        this.isAnimating = false;
        // Return to default state after animation
        setTimeout(() => {
          this.setKeyboardState(false);
        }, 200);
      });
    });
  }

  /**
   * Set keyboard state (true for typing, false for default)
   */
  private setKeyboardState(isTyping: boolean): void {
    this.playerDefaultSprite.visible = !isTyping;
    this.playerKeyboardSprite.visible = isTyping;
  }

  /**
   * Update player and bullets
   */
  public update(deltaTime: number): void {
    // Update bullets
    this.updateBullets(deltaTime);
  }

  /**
   * Check collision with a word (for taking damage)
   */
  public checkCollisionWithWord(word: Word): boolean {
    if (this.isDefeated) return false;

    // Simple distance-based collision
    const dx = this.x - word.x;
    const dy = this.y - word.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Player collision radius (adjust as needed)
    const collisionRadius = 100;

    return distance < collisionRadius;
  }

  /**
   * Update all bullets
   */
  private updateBullets(deltaTime: number): void {
    this.bullets = this.bullets.filter((bullet) => {
      bullet.update(deltaTime);

      // Remove bullets that are off-screen or have hit target
      if (bullet.shouldDestroy()) {
        if (bullet.parent) {
          bullet.parent.removeChild(bullet);
        }
        bullet.destroy();
        return false;
      }

      return true;
    });
  }

  /**
   * Get all active bullets
   */
  public getBullets(): Bullet[] {
    return [...this.bullets];
  }

  /**
   * Clear all bullets
   */
  public clearBullets(): void {
    this.bullets.forEach((bullet) => {
      if (bullet.parent) {
        bullet.parent.removeChild(bullet);
      }
      bullet.destroy();
    });
    this.bullets = [];
  }

  /**
   * Get bullet count
   */
  public getBulletCount(): number {
    return this.bullets.length;
  }

  /**
   * Set player lives
   */
  public setLives(lives: number): void {
    this.maxLives = lives;
    this.currentLives = lives;
    this.isDefeated = false;
    this.updateHeartsDisplay();
  }

  /**
   * Take damage (lose one life)
   */
  public takeDamage(): void {
    if (this.isDefeated) return;

    this.currentLives = Math.max(0, this.currentLives - 1);

    console.log(
      `Player lost 1 life, lives remaining: ${this.currentLives}/${this.maxLives}`,
    );

    this.updateHeartsDisplay();
    this.playHitAnimation();

    // Trigger damage callback
    if (this.onTakeDamage) {
      this.onTakeDamage();
    }

    // Check if defeated
    if (this.currentLives <= 0) {
      this.defeat();
    }
  }

  /**
   * Update hearts display
   */
  private updateHeartsDisplay(): void {
    for (let i = 0; i < this.hearts.length; i++) {
      const heart = this.hearts[i];
      if (i < this.currentLives) {
        // Active heart - bright red
        heart.tint = 0xff0000;
        heart.alpha = 1;
      } else {
        // Lost heart - dark/transparent
        heart.tint = 0x666666;
        heart.alpha = 0.3;
      }
    }
  }

  /**
   * Play hit animation
   */
  private playHitAnimation(): void {
    // Flash red briefly
    const originalTint = this.playerDefaultSprite.tint;
    this.playerDefaultSprite.tint = 0xff0000;
    this.playerKeyboardSprite.tint = 0xff0000;

    // Simple shake animation with timeouts
    const originalX = this.x;
    this.x = originalX - 10;
    setTimeout(() => {
      this.x = originalX + 10;
      setTimeout(() => {
        this.x = originalX;
      }, 50);
    }, 50);

    // Restore original tint
    setTimeout(() => {
      this.playerDefaultSprite.tint = originalTint;
      this.playerKeyboardSprite.tint = originalTint;
    }, 100);
  }

  /**
   * Defeat the player
   */
  private defeat(): void {
    if (this.isDefeated) return;

    this.isDefeated = true;
    console.log("Player defeated!");

    // Play defeat animation
    this.playerDefaultSprite.alpha = 0.5;
    this.playerKeyboardSprite.alpha = 0.5;
    this.scale.set(0.8);

    setTimeout(() => {
      if (this.onDefeated) {
        this.onDefeated();
      }
    }, 1000);
  }

  /**
   * Get current lives
   */
  public getCurrentLives(): number {
    return this.currentLives;
  }

  /**
   * Get max lives
   */
  public getMaxLives(): number {
    return this.maxLives;
  }

  /**
   * Get lives percentage
   */
  public getLivesPercentage(): number {
    if (this.maxLives === 0) return 0;
    return this.currentLives / this.maxLives;
  }

  /**
   * Reset player to initial state
   */
  public reset(): void {
    this.currentLives = this.maxLives;
    this.isDefeated = false;
    this.alpha = 1;
    this.playerDefaultSprite.alpha = 1;
    this.playerKeyboardSprite.alpha = 1;
    this.scale.set(1);
    this.playerDefaultSprite.tint = 0xffffff;
    this.playerKeyboardSprite.tint = 0xffffff;
    this.x = this.playerX;
    this.y = this.playerY;
    this.updateHeartsDisplay();
  }

  /**
   * Destroy player and cleanup
   */
  public destroy(): void {
    this.clearBullets();
    super.destroy();
  }
}
