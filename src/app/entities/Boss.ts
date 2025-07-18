import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { GameConstants } from "../data/GameConstants";
import {
  MessageDictionary,
  type MessageEntry,
} from "../data/MessageDictionary";
import { Label } from "../ui/Label";
import { MessageBubble } from "../ui/MessageBubble";

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

  /** Boss messages for level 3 */
  private bossMessages: MessageEntry[] = [];

  /** Message spawn timer in seconds */
  private messageSpawnTimer: number = 0;

  /** Message spawn interval (8 seconds) */
  private readonly MESSAGE_SPAWN_INTERVAL = 20;

  /** Whether boss should spawn messages */
  private shouldSpawnMessages: boolean = false;

  /** Callback to spawn boss message word */
  public onSpawnBossMessage?: (text: string) => void;

  /** Message bubble for boss speech */
  private messageBubble: MessageBubble | null = null;

  /** Whether boss is currently speaking */
  private isSpeaking: boolean = false;

  /** Current message timeout */
  private messageTimeout: number | null = null;

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
    this.initializeBossMessages();
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
    } else {
      // Sometimes say a threat when taking damage (20% chance)
      if (Math.random() < 0.2) {
        this.sayRandomThreat();
      }
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
    this.hideMessage(); // Clear any messages
    this.stopSpawningMessages(); // Stop message spawning
    this.updateHealthBar();
  }

  /**
   * Update boss (called every frame)
   */
  public update(deltaTime: number): void {
    // Update message spawning timer
    if (this.shouldSpawnMessages && !this.isDefeated) {
      this.messageSpawnTimer += deltaTime;

      // Spawn message every 15 seconds
      if (this.messageSpawnTimer >= this.MESSAGE_SPAWN_INTERVAL) {
        this.spawnBossMessage();
        this.messageSpawnTimer = 0;
      }
    }
  }

  /**
   * Show a message from the boss
   */
  public showMessage(message: string, duration: number = 3000): void {
    // Clear any existing message
    this.hideMessage();

    // Create new message bubble
    this.messageBubble = new MessageBubble("арман", message, {
      maxWidth: 400,
      messageSize: 22,
      level: 3,
      backgroundColor: 0x4a0e0e, // Dark red background for boss
      leftStrokeColor: 0xff0000, // Red stroke
      leftStrokeWidth: 5,
      cornerRadius: 15,
      senderNameColor: 0xffaaaa, // Light red text
      messageColor: 0xffffff, // White message text
    });

    // Position message bubble above boss
    this.messageBubble.x = -this.messageBubble.bubbleWidth / 2;
    this.messageBubble.y = -200; // Above health bar
    this.addChild(this.messageBubble);

    this.isSpeaking = true;

    // Auto-hide after duration
    if (duration > 0) {
      this.messageTimeout = window.setTimeout(() => {
        this.hideMessage();
      }, duration);
    }

    console.log(`Boss says: "${message}"`);
  }

  /**
   * Hide the current message
   */
  public hideMessage(): void {
    if (this.messageBubble) {
      this.removeChild(this.messageBubble);
      this.messageBubble = null;
    }

    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }

    this.isSpeaking = false;
  }

  /**
   * Check if boss is currently speaking
   */
  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get word spawn position for boss messages
   */
  public getWordSpawnPosition(): { x: number; y: number } {
    return {
      x: this.x - 100,
      y: this.y - 50,
    };
  }

  /**
   * Say a random threatening message when taking damage
   */
  public sayRandomThreat(): void {
    const threats = [
      "Это все, на что ты способен?",
      "Твои слова слишком слабы!",
      "Я покажу тебе настоящую силу!",
      "Ты не сможешь меня победить!",
      "Моя мощь безгранична!",
      "Твоя попытка жалка!",
      "Я непобедим!",
    ];

    const randomThreat = threats[Math.floor(Math.random() * threats.length)];
    this.showMessage(randomThreat, 2000);
  }

  /**
   * Say encouraging words when boss is defeated
   */
  public sayDefeatMessage(): void {
    const defeatMessages = [
      "Невозможно... Как ты это сделал?",
      "Твоя сила слов впечатляет...",
      "Ты действительно достоин победы.",
      "Это был достойный бой!",
      "Ты превзошел мои ожидания...",
    ];

    const randomMessage =
      defeatMessages[Math.floor(Math.random() * defeatMessages.length)];
    this.showMessage(randomMessage, 4000);
  }

  /**
   * Say greeting message when boss appears
   */
  public sayGreeting(): void {
    const greetings = [
      "Добро пожаловать на финальный уровень!",
      "Готов ли ты к настоящему испытанию?",
      "Покажи мне силу своих слов!",
      "Время проверить твои навыки!",
    ];

    const randomGreeting =
      greetings[Math.floor(Math.random() * greetings.length)];
    this.showMessage(randomGreeting, 3000);
  }

  /**
   * Initialize boss messages from dictionary
   */
  private initializeBossMessages(): void {
    // Get all messages for level 3 by "арман" author
    this.bossMessages = MessageDictionary.getMessagesByLevel(3).filter(
      (msg) => msg.author === "арман",
    );

    console.log(
      "Boss - initialized with messages:",
      this.bossMessages.map((m) => m.text),
    );
  }

  /**
   * Start spawning boss messages
   */
  public startSpawningMessages(): void {
    this.shouldSpawnMessages = true;
    this.messageSpawnTimer = 0;
    console.log("Boss - started spawning messages");
  }

  /**
   * Stop spawning boss messages
   */
  public stopSpawningMessages(): void {
    this.shouldSpawnMessages = false;
    this.messageSpawnTimer = 0;
    console.log("Boss - stopped spawning messages");
  }

  /**
   * Spawn a boss message word that moves towards player
   */
  private spawnBossMessage(): void {
    if (this.bossMessages.length === 0) {
      console.log("Boss - no messages available to spawn");
      return;
    }

    // Get random message from boss messages
    const randomIndex = Math.floor(Math.random() * this.bossMessages.length);
    const message = this.bossMessages[randomIndex];

    console.log("Boss - spawning attack message:", message.text);

    // Spawn the message as a word that player must type to defend
    if (this.onSpawnBossMessage) {
      this.onSpawnBossMessage(message.text);
    }
  }

  /**
   * Reset message spawning timer
   */
  public resetMessageTimer(): void {
    this.messageSpawnTimer = 0;
  }
}
