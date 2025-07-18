import { animate } from "motion";
import { Container, Sprite, Texture } from "pixi.js";
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
    this.playerDefaultSprite.anchor.set(0.5);
    this.playerDefaultSprite.width = this.playerSize;
    this.playerDefaultSprite.height = this.playerSize;

    // Create keyboard state sprite
    this.playerKeyboardSprite = new Sprite(Texture.from("main/player/1.PNG"));
    this.playerKeyboardSprite.anchor.set(0.5);
    this.playerKeyboardSprite.width = this.playerSize;
    this.playerKeyboardSprite.height = this.playerSize;
    this.playerKeyboardSprite.visible = false;

    this.addChild(this.playerDefaultSprite);
    this.addChild(this.playerKeyboardSprite);
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
   * Destroy player and cleanup
   */
  public destroy(): void {
    this.clearBullets();
    super.destroy();
  }
}
