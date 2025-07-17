import type { Container } from "pixi.js";

import { GameConstants } from "../data/GameConstants";
import { WordDictionary } from "../data/WordDictionary";
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

  constructor(container: Container) {
    this.container = container;
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
    const wordText = WordDictionary.getRandomWord(this.currentDifficulty);
    const speed = this.getSpeedForDifficulty();

    const word = new Word(wordText, speed);

    // Set spawn position on right edge
    word.x = GameConstants.WORD_SPAWN_X;
    word.y = this.getRandomSpawnY();

    this.activeWords.push(word);
    this.container.addChild(word);
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
    this.activeWords = this.activeWords.filter((word) => {
      if (word.isCompleted || word.hasReachedEdge) {
        word.destroy();
        return false;
      }
      return true;
    });
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
   * Cleanup - remove all words and stop spawning
   */
  public destroy(): void {
    this.stopSpawning();
    this.clearAllWords();
  }
}
