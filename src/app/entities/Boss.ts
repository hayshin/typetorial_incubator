import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { GameConstants } from "../data/GameConstants";
import { Label } from "../ui/Label";

/**
 * Boss entity for level 3
 * Appears on the right side and has a health bar
 */
export class Boss extends Container {
  /** Boss sprite/visual representation */
  private bossSprite: Sprite;

  /** Health bar background */
  private healthBarBg: Graphics;

  /** Health bar fill */
  private healthBarFill: Graphics;

  /** Health bar label */
  private healthLabel: Label;

  /** Current health */
  private currentHealth: number = 100;

  /** Maximum health */
  private maxHealth: number = 100;

  /** Health bar width */
  private readonly HEALTH_BAR_WIDTH = 200;

  /** Health bar height */
  private readonly HEALTH_BAR_HEIGHT = 20;

  /** Whether boss is defeated */
  public isDefeated: boolean = false;

  /** Callback when boss is defeated */
  public onDefeated?: () => void;

  constructor() {
    super();

    // Create boss sprite using arman mentor image
    this.bossSprite = new Sprite(Texture.from("main/mentors/arman/0.png"));
    this.bossSprite.width = 600;
    this.bossSprite.height = 360;
    this.bossSprite.anchor.set(0.5, 1); // Bottom center
    this.addChild(this.bossSprite);

    // Create health bar background
    this.healthBarBg = new Graphics();
    this.healthBarBg.rect(
      -this.HEALTH_BAR_WIDTH / 2,
      -160,
      this.HEALTH_BAR_WIDTH,
      this.HEALTH_BAR_HEIGHT,
    );
    this.healthBarBg.fill(0x333333);
    this.healthBarBg.stroke({ color: 0x666666, width: 2 });
    this.addChild(this.healthBarBg);

    // Create health bar fill
    this.healthBarFill = new Graphics();
    this.addChild(this.healthBarFill);

    // Create health label
    this.healthLabel = new Label({
      text: "100 / 100",
      style: {
        fontSize: 16,
        fill: 0xffffff,
        fontWeight: "bold",
      },
    });
    this.healthLabel.anchor.set(0.5);
    this.healthLabel.y = -140;
    this.addChild(this.healthLabel);

    // Position boss on right side
    this.x = GameConstants.MONSTER_X;
    this.y = 300;

    this.updateHealthBar();
  }

  /**
   * Set boss health based on text length
   */
  public setHealth(health: number): void {
    this.maxHealth = health;
    this.currentHealth = health;
    this.isDefeated = false;
    this.updateHealthBar();
  }

  /**
   * Take damage from a word
   */
  public takeDamage(wordLength: number): void {
    if (this.isDefeated) return;

    const damage = wordLength + 1; // 2 damage per character
    this.currentHealth = Math.max(0, this.currentHealth - damage);

    console.log(
      `Boss took ${damage} damage (word length: ${wordLength}), health: ${this.currentHealth}/${this.maxHealth}`,
    );

    this.updateHealthBar();
    this.playHitAnimation();

    // Check if defeated
    if (this.currentHealth <= 0) {
      this.defeat();
    }
  }

  /**
   * Update health bar visual
   */
  private updateHealthBar(): void {
    // Clear and redraw fill
    this.healthBarFill.clear();

    if (this.currentHealth > 0) {
      const fillWidth =
        (this.currentHealth / this.maxHealth) * this.HEALTH_BAR_WIDTH;
      const healthPercent = this.currentHealth / this.maxHealth;

      // Color based on health percentage
      let fillColor = 0x00ff00; // Green
      if (healthPercent < 0.6) fillColor = 0xffff00; // Yellow
      if (healthPercent < 0.3) fillColor = 0xff0000; // Red

      this.healthBarFill.rect(
        -this.HEALTH_BAR_WIDTH / 2,
        -160,
        fillWidth,
        this.HEALTH_BAR_HEIGHT,
      );
      this.healthBarFill.fill(fillColor);
    }

    // Update health label
    this.healthLabel.text = `${this.currentHealth} / ${this.maxHealth}`;
  }

  /**
   * Play hit animation
   */
  private playHitAnimation(): void {
    // Flash red briefly
    const originalTint = this.bossSprite.tint;
    this.bossSprite.tint = 0xff0000;

    // Simple shake animation with timeouts
    const originalX = this.x;
    this.x = originalX + 10;
    setTimeout(() => {
      this.x = originalX - 10;
      setTimeout(() => {
        this.x = originalX;
      }, 50);
    }, 50);

    // Restore original tint
    setTimeout(() => {
      this.bossSprite.tint = originalTint;
    }, 100);
  }

  /**
   * Defeat the boss
   */
  private defeat(): void {
    if (this.isDefeated) return;

    this.isDefeated = true;
    console.log("Boss defeated!");

    // Play defeat animation
    this.bossSprite.alpha = 0;
    this.bossSprite.scale.set(1.5, 1.5);
    this.y += 100;
    
    setTimeout(() => {
      if (this.onDefeated) {
        this.onDefeated();
      }
    }, 1000);
  }

  /**
   * Show boss with entrance animation
   */
  public async show(): Promise<void> {
    // Start from right edge, outside screen
    const originalX = this.x;
    this.x = originalX + 200;
    this.alpha = 1000;

    // Simple entrance animation
    this.alpha = 1;
    this.x = originalX;
  }

  /**
   * Hide boss with exit animation
   */
  public async hide(): Promise<void> {
    this.alpha = 0;
    this.x += 200;
  }

  /**
   * Get current health
   */
  public getCurrentHealth(): number {
    return this.currentHealth;
  }

  /**
   * Get max health
   */
  public getMaxHealth(): number {
    return this.maxHealth;
  }

  /**
   * Get health percentage
   */
  public getHealthPercentage(): number {
    if (this.maxHealth === 0) return 0;
    return this.currentHealth / this.maxHealth;
  }

  /**
   * Reset boss to initial state
   */
  public reset(): void {
    this.currentHealth = this.maxHealth;
    this.isDefeated = false;
    this.alpha = 1;
    this.bossSprite.alpha = 1;
    this.bossSprite.scale.set(1);
    this.bossSprite.tint = GameConstants.COLORS.MONSTER;
    this.x = GameConstants.MONSTER_X;
    this.y = 500;
    this.updateHealthBar();
  }

  /**
   * Update boss (called every frame)
   */
  public update(_deltaTime: number): void {
    // Boss doesn't need frame updates currently
    // Can add idle animations or other behaviors here
  }
}
