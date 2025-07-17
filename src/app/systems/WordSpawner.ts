import type { Container } from "pixi.js";
import { GameState } from "../core/GameState";
import { GameConstants } from "../data/GameConstants";
import {
  MessageDictionary,
  type MessageEntry,
} from "../data/MessageDictionary";
import { Word } from "../entities/Word";

/**
 * Manages spawning and lifecycle of words in the game
 */
export class WordSpawner {
  /** Container to add words to */
  private container: Container;

  /** Array of active words */
  private activeWords: Word[] = [];

  /** Timer for spawning new words */
  private spawnTimer: number = 0;

  /** Current spawn interval in milliseconds */
  private spawnInterval: number = GameConstants.WORD_SPAWN_INTERVAL;

  /** Current difficulty level */
  private currentDifficulty: "easy" | "medium" | "hard" = "easy";

  /** Maximum number of words on screen */
  private maxWords: number = 5;

  /** Whether spawning is enabled */
  private isSpawning: boolean = true;

  /** Callback when word reaches the edge */
  public onWordReachedEdge?: (word: Word) => void;

  /** Callback when word is completed */
  public onWordCompleted?: (word: Word) => void;

  /** Callback when level should advance */
  public onLevelAdvance?: (nextLevel: 1 | 2 | 3) => void;

  /** Messages remaining in current level */
  private remainingMessages: MessageEntry[] = [];

  /** Total messages for current level */
  private totalMessages: number = 0;

  constructor(container: Container) {
    this.container = container;
    this.initializeLevel();
  }

  /**
   * Update the spawner - handle spawning and word lifecycle
   */
  public update(deltaTime: number): void {
    // Update spawn timer
    this.spawnTimer += deltaTime * 1000; // Convert to milliseconds

    // Spawn new word if timer elapsed and conditions are met
    if (
      this.isSpawning &&
      this.spawnTimer >= this.spawnInterval &&
      this.activeWords.length < this.maxWords
    ) {
      this.spawnWord();
      this.spawnTimer = 0;
    }

    // Update all active words
    this.updateWords(deltaTime);

    // Clean up completed or off-screen words
    this.cleanupWords();
  }

  /**
   * Spawn a new word
   */
  private spawnWord(): void {
    // Only spawn if we have remaining messages for this level
    if (this.remainingMessages.length === 0) {
      console.log("WordSpawner - no more messages to spawn");
      return;
    }

    // Use message from remaining queue
    const randomIndex = Math.floor(
      Math.random() * this.remainingMessages.length,
    );
    const messageEntry = this.remainingMessages[randomIndex];
    this.remainingMessages.splice(randomIndex, 1);

    console.log(
      "WordSpawner - spawning word:",
      messageEntry.text,
      "by:",
      messageEntry.author,
      "remaining:",
      this.remainingMessages.length,
    );

    // Update progress
    this.updateLevelProgress();

    const speed = this.getSpeedForDifficulty();
    const word = new Word(messageEntry.text, speed);

    // Set spawn position based on level and author
    const spawnPosition = this.getSpawnPosition(messageEntry);
    word.x = spawnPosition.x;
    word.y = spawnPosition.y;

    console.log("WordSpawner - word positioned at:", word.x, word.y);
    this.activeWords.push(word);
    this.container.addChild(word);
  }

  /**
   * Get spawn position based on level and message author
   */
  private getSpawnPosition(messageEntry: MessageEntry): {
    x: number;
    y: number;
  } {
    const currentLevel = GameState.getCurrentLevel();

    // Level 2: Messages from "асель" spawn from center
    if (currentLevel === 2 && messageEntry.author === "асель") {
      return {
        x: 1000, // Center horizontally
        y: 0, // Center vertically
      };
    }

    // Default spawn from right edge
    return {
      x: GameConstants.WORD_SPAWN_X,
      y: this.getRandomSpawnY(),
    };
  }

  /**
   * Get random Y position for spawning
   */
  private getRandomSpawnY(): number {
    const { min, max } = GameConstants.WORD_SPAWN_Y_RANGE;
    return Math.random() * (max - min) + min;
  }

  /**
   * Update all active words
   */
  private updateWords(deltaTime: number): void {
    this.activeWords.forEach((word) => {
      word.update(deltaTime);

      // Check if word reached edge
      if (word.hasReachedEdge && this.onWordReachedEdge) {
        this.onWordReachedEdge(word);
      }

      // Check if word completed
      if (word.isCompleted && this.onWordCompleted) {
        this.onWordCompleted(word);
      }
    });
  }

  /**
   * Clean up words that are completed or off-screen
   */
  private cleanupWords(): void {
    const wordsToRemove: Word[] = [];

    this.activeWords = this.activeWords.filter((word) => {
      if (word.isCompleted || word.hasReachedEdge) {
        console.log(
          "WordSpawner - removing word:",
          word.targetText,
          "completed:",
          word.isCompleted,
          "reachedEdge:",
          word.hasReachedEdge,
          "position:",
          word.x,
        );
        wordsToRemove.push(word);
        word.destroy();
        return false;
      }
      return true;
    });

    // Check if level should advance after cleaning up words
    if (this.remainingMessages.length === 0 && this.activeWords.length === 0) {
      this.handleLevelComplete();
    }
  }

  /**
   * Get speed based on current difficulty
   */
  private getSpeedForDifficulty(): number {
    switch (this.currentDifficulty) {
      case "easy":
        return GameConstants.DIFFICULTY_LEVELS.EASY.wordSpeed;
      case "medium":
        return GameConstants.DIFFICULTY_LEVELS.MEDIUM.wordSpeed;
      case "hard":
        return GameConstants.DIFFICULTY_LEVELS.HARD.wordSpeed;
      default:
        return GameConstants.WORD_SPEED;
    }
  }

  /**
   * Set difficulty level
   */
  public setDifficulty(difficulty: "easy" | "medium" | "hard"): void {
    this.currentDifficulty = difficulty;

    // Update spawn interval based on difficulty
    const levelConfig =
      GameConstants.DIFFICULTY_LEVELS[
        difficulty.toUpperCase() as keyof typeof GameConstants.DIFFICULTY_LEVELS
      ];
    this.spawnInterval = levelConfig.spawnInterval;
  }

  /**
   * Get all active words
   */
  public getActiveWords(): Word[] {
    return [...this.activeWords];
  }

  /**
   * Find word that matches input
   */
  public findMatchingWord(input: string): Word | null {
    // First, try to find word that exactly matches the input start
    for (const word of this.activeWords) {
      if (word.matchesInput(input) && !word.isCompleted) {
        return word;
      }
    }
    return null;
  }

  /**
   * Get word currently being typed (active word)
   */
  public getActiveWord(): Word | null {
    return this.activeWords.find((word) => word.isActive) || null;
  }

  /**
   * Set a word as active for typing
   */
  public setActiveWord(targetWord: Word | null): void {
    // Deactivate all words first
    this.activeWords.forEach((word) => {
      word.setActive(false);
    });

    // Activate target word
    if (targetWord) {
      targetWord.setActive(true);
    }
  }

  /**
   * Try to type character on active word
   */
  public typeCharacter(char: string): boolean {
    const activeWord = this.getActiveWord();
    if (activeWord) {
      return activeWord.typeCharacter(char);
    }
    return false;
  }

  /**
   * Start spawning words
   */
  public startSpawning(): void {
    this.isSpawning = true;
    this.spawnTimer = 0;
  }

  /**
   * Stop spawning words
   */
  public stopSpawning(): void {
    this.isSpawning = false;
  }

  /**
   * Clear all words from screen
   */
  public clearAllWords(): void {
    this.activeWords.forEach((word) => {
      word.destroy();
    });
    this.activeWords = [];
  }

  /**
   * Set maximum number of words on screen
   */
  public setMaxWords(maxWords: number): void {
    this.maxWords = maxWords;
  }

  /**
   * Set custom spawn interval
   */
  public setSpawnInterval(interval: number): void {
    this.spawnInterval = interval;
  }

  /**
   * Get current word count
   */
  public getWordCount(): number {
    return this.activeWords.length;
  }

  /**
   * Force spawn a specific word (for testing)
   */
  public spawnSpecificWord(text: string): Word {
    const speed = this.getSpeedForDifficulty();
    const word = new Word(text, speed);

    this.activeWords.push(word);
    this.container.addChild(word);

    return word;
  }

  /**
   * Initialize level - load messages for current level
   */
  private initializeLevel(): void {
    const currentLevel = GameState.getCurrentLevel();

    if (currentLevel === 1 || currentLevel === 2) {
      // Get all messages for current level
      const levelMessages = MessageDictionary.getMessagesByLevel(currentLevel);

      // Shuffle the messages for randomness
      const shuffledMessages = [...levelMessages].sort(
        () => Math.random() - 0.5,
      );

      // For testing: only use the first 2 messages from shuffled array
      this.remainingMessages = shuffledMessages.slice(0, 2);
      this.totalMessages = this.remainingMessages.length;

      console.log(
        "WordSpawner - initialized level",
        currentLevel,
        "with messages:",
        this.remainingMessages.map((msg) => msg.text),
      );
    } else {
      // Level 3 doesn't use messages from dictionary
      this.remainingMessages = [];
      this.totalMessages = 0;
    }

    // Reset progress
    GameState.setLevelProgress(0);
  }

  /**
   * Update level progress based on remaining messages
   */
  private updateLevelProgress(): void {
    if (this.totalMessages > 0) {
      const completed = this.totalMessages - this.remainingMessages.length;
      const progress = (completed / this.totalMessages) * 100;
      GameState.setLevelProgress(progress);
    }
  }

  /**
   * Handle level completion
   */
  private handleLevelComplete(): void {
    const currentLevel = GameState.getCurrentLevel();
    console.log(
      "WordSpawner - handleLevelComplete, currentLevel:",
      currentLevel,
    );

    if (currentLevel < 3) {
      const nextLevel = (currentLevel + 1) as 1 | 2 | 3;
      console.log("WordSpawner - transitioning to nextLevel:", nextLevel);

      // Start level transition
      GameState.startLevelTransition(nextLevel);

      // Notify about level advance
      if (this.onLevelAdvance) {
        this.onLevelAdvance(nextLevel);
      }
    }
  }

  /**
   * Reset for new level
   */
  public resetForLevel(): void {
    this.clearAllWords();
    this.initializeLevel();
  }

  /**
   * Get remaining message count
   */
  public getRemainingMessageCount(): number {
    return this.remainingMessages.length;
  }

  /**
   * Get total message count for current level
   */
  public getTotalMessageCount(): number {
    return this.totalMessages;
  }

  /**
   * Cleanup - remove all words and stop spawning
   */
  public destroy(): void {
    this.stopSpawning();
    this.clearAllWords();
  }
}
