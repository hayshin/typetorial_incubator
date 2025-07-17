import { animate } from "motion";
import { Container, Graphics } from "pixi.js";
import { GameConstants } from "../data/GameConstants";
import { Bullet } from "./Bullet";
import type { Word } from "./Word";

/**
 * Represents the player character that shoots bullets at words
 */
export class Player extends Container {
  /** Player's visual representation */
  private playerGraphics!: Graphics;

  /** Array of active bullets */
  private bullets: Bullet[] = [];

  /** Container for bullets */
  private bulletContainer: Container;

  /** Current target word */
  private currentTarget: Word | null = null;

  /** Player's position on the left side of the screen */
  private playerX: number;
  private playerY: number;

  /** Player's color */
  private playerColor: number = GameConstants.COLORS.PLAYER;

  /** Player size */
  private playerSize: number = 30;

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
    this.playerGraphics = new Graphics();

    // Draw player as a circle/character with border for visibility
    this.playerGraphics.circle(0, 0, this.playerSize + 2).fill(0x000000); // Black border
    this.playerGraphics.circle(0, 0, this.playerSize).fill(this.playerColor);

    // Add a simple face
    this.playerGraphics.circle(-8, -8, 3).fill(0xffffff); // Left eye
    this.playerGraphics.circle(8, -8, 3).fill(0xffffff); // Right eye
    this.playerGraphics.rect(-8, 5, 16, 3).fill(0xffffff); // Mouth

    // Add a direction indicator (small arrow pointing right)
    this.playerGraphics.moveTo(this.playerSize - 5, -5);
    this.playerGraphics.lineTo(this.playerSize + 10, 0);
    this.playerGraphics.lineTo(this.playerSize - 5, 5);
    this.playerGraphics.fill(0xffff00); // Yellow arrow

    this.addChild(this.playerGraphics);

    console.log(`Player created at position: (${this.x}, ${this.y})`);
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
    const startX = this.x + this.playerSize;
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

    // Quick flash animation
    const originalScale = { x: this.scale.x, y: this.scale.y };

    animate(this.scale, { x: 1.2, y: 1.2 }, { duration: 0.1 }).then(() => {
      animate(this.scale, originalScale, { duration: 0.1 }).then(() => {
        this.isAnimating = false;
      });
    });

    // Color flash
    this.playerGraphics.clear();
    this.playerGraphics.circle(0, 0, this.playerSize).fill(0xffff00); // Yellow flash

    // Add face back
    this.playerGraphics.circle(-8, -8, 3).fill(0x000000);
    this.playerGraphics.circle(8, -8, 3).fill(0x000000);
    this.playerGraphics.rect(-8, 5, 16, 3).fill(0x000000);

    setTimeout(() => {
      this.createPlayerGraphics();
    }, 100);
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
