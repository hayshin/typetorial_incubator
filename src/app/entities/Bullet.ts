import { animate } from "motion";
import { Container, Graphics } from "pixi.js";
import { GameConstants } from "../data/GameConstants";
import type { Word } from "./Word";

/**
 * Represents a bullet that flies from player to target word
 */
export class Bullet extends Container {
  /** Bullet's visual representation */
  private bulletGraphics!: Graphics;

  /** Target word to fly towards */
  private target: Word | null = null;

  /** Movement velocity */
  private velocityX: number = 0;
  private velocityY: number = 0;

  /** Bullet speed */
  private speed: number = GameConstants.BULLET_SPEED;

  /** Whether bullet should be destroyed */
  private shouldBeDestroyed: boolean = false;

  /** Whether bullet has reached its target */
  private hasReachedTarget: boolean = false;

  /** Bullet size */
  private bulletSize: number = GameConstants.BULLET_SIZE;

  /** Color cycling for bullet */
  private colorIndex: number = 0;
  private colorChangeTimer: number = 0;
  private readonly COLOR_CHANGE_INTERVAL: number = 0.2; // Change color every 0.2 seconds

  constructor() {
    super();

    this.createBulletGraphics();
  }

  /**
   * Create bullet's visual representation
   */
  private createBulletGraphics(): void {
    this.bulletGraphics = new Graphics();

    // Draw bullet as a green square like GitHub contributions
    const squareSize = this.bulletSize * 2;
    this.bulletGraphics
      .rect(-squareSize / 2, -squareSize / 2, squareSize, squareSize)
      .fill(0x00ff00); // Initial green color

    // Add subtle border
    this.bulletGraphics
      .rect(-squareSize / 2, -squareSize / 2, squareSize, squareSize)
      .stroke({ color: 0x00cc00, width: 1 });

    this.addChild(this.bulletGraphics);

    // Initial scale animation
    this.scale.set(0);
    animate(this.scale, { x: 1, y: 1 }, { duration: 0.1, ease: "backOut" });
  }

  /**
   * Set target word for the bullet
   */
  public setTarget(target: Word): void {
    this.target = target;
    this.calculateVelocity();
  }

  /**
   * Calculate velocity towards target
   */
  private calculateVelocity(): void {
    if (!this.target) return;

    // Calculate direction to target (both bullet and target are in same coordinate system)
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize and multiply by speed
    if (distance > 0) {
      this.velocityX = (dx / distance) * this.speed;
      this.velocityY = (dy / distance) * this.speed;

      console.log(
        `Bullet velocity calculated: vx=${this.velocityX.toFixed(2)}, vy=${this.velocityY.toFixed(2)}, distance=${distance.toFixed(2)}`,
      );
    }
  }

  /**
   * Update bullet position and color
   */
  public update(deltaTime: number): void {
    if (this.shouldBeDestroyed) return;

    // Update color cycling
    this.updateColor(deltaTime);

    // Move bullet
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;

    // Check if reached target
    this.checkTargetCollision();

    // Check if bullet is off-screen
    this.checkBounds();

    // Recalculate direction periodically to follow moving target
    if (this.target && !this.hasReachedTarget) {
      // Only recalculate every few frames to avoid jittery movement
      if (Math.random() < 0.1) {
        this.calculateVelocity();
      }
    }
  }

  /**
   * Update bullet color cycling
   */
  private updateColor(deltaTime: number): void {
    this.colorChangeTimer += deltaTime;
    
    if (this.colorChangeTimer >= this.COLOR_CHANGE_INTERVAL) {
      this.colorChangeTimer = 0;
      this.colorIndex = (this.colorIndex + 1) % 5; // Cycle through 5 colors
      
      // GitHub contribution green shades
      const greenShades = [
        0x0a4620, // Darkest green
        0x006d32, // Dark green
        0x0e8a16, // Medium green
        0x26a641, // Light green
        0x39d353, // Lightest green
      ];
      
      const newColor = greenShades[this.colorIndex];
      
      // Update bullet color
      this.bulletGraphics.clear();
      const squareSize = this.bulletSize * 2;
      this.bulletGraphics
        .rect(-squareSize / 2, -squareSize / 2, squareSize, squareSize)
        .fill(newColor);
      
      // Add subtle border
      this.bulletGraphics
        .rect(-squareSize / 2, -squareSize / 2, squareSize, squareSize)
        .stroke({ color: newColor, alpha: 0.8, width: 1 });
    }
  }

  /**
   * Check collision with target word
   */
  private checkTargetCollision(): void {
    if (!this.target || this.hasReachedTarget) return;

    // Simple distance-based collision (both in same coordinate system)
    const dx = this.x - this.target.x;
    const dy = this.y - this.target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 50) {
      // Hit the target
      this.hitTarget();
    }
  }

  /**
   * Handle hitting the target
   */
  private hitTarget(): void {
    this.hasReachedTarget = true;

    // Create hit effect
    this.createHitEffect();

    // Mark for destruction
    this.shouldBeDestroyed = true;
  }

  /**
   * Create visual effect when bullet hits target
   */
  private createHitEffect(): void {
    // Scale up and fade out effect
    animate(this.scale, { x: 2, y: 2 }, { duration: 0.2, ease: "backOut" });

    // Fade out effect
    animate(this.alpha, 0, { duration: 0.2 });
  }

  /**
   * Check if bullet is outside game bounds
   */
  private checkBounds(): void {
    const gameWidth = GameConstants.GAME_WIDTH;
    const gameHeight = GameConstants.GAME_HEIGHT;

    // Much larger bounds to prevent premature destruction
    if (
      this.x < -gameWidth - 500 ||
      this.x > gameWidth + 500 ||
      this.y < -gameHeight - 500 ||
      this.y > gameHeight + 500
    ) {
      console.log(
        `Bullet destroyed by bounds check at (${this.x.toFixed(2)}, ${this.y.toFixed(2)})`,
      );
      this.shouldBeDestroyed = true;
    }
  }

  /**
   * Check if bullet should be destroyed
   */
  public shouldDestroy(): boolean {
    return this.shouldBeDestroyed;
  }

  /**
   * Get current target
   */
  public getTarget(): Word | null {
    return this.target;
  }

  /**
   * Check if bullet has reached its target
   */
  public hasHitTarget(): boolean {
    return this.hasReachedTarget;
  }

  /**
   * Force destroy the bullet
   */
  public destroy(): void {
    this.shouldBeDestroyed = true;

    // Quick fade out if not already fading
    if (this.alpha > 0) {
      animate(this.alpha, 0, { duration: 0.1 }).then(() => {
        super.destroy();
      });
    } else {
      super.destroy();
    }
  }
}
