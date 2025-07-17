/**
 * Central game manager that coordinates all game systems
 * Handles game state, scoring, lives, and level progression
 */
import type { Container } from "pixi.js";

import { GameConstants } from "../data/GameConstants";
import type { Word } from "../entities/Word";
import { WordSpawner } from "../systems/WordSpawner";

export enum GameState {
  MENU = "menu",
  PLAYING = "playing",
  PAUSED = "paused",
  GAME_OVER = "game_over",
  LEVEL_COMPLETE = "level_complete",
}

export interface GameStats {
  score: number;
  lives: number;
  level: number;
  wordsCompleted: number;
  wordsLost: number;
  accuracy: number;
  totalCharactersTyped: number;
  correctCharacters: number;
  timeElapsed: number;
}

/**
 * Main game manager class
 */
export class GameManager {
  /** Current game state */
  private currentState: GameState = GameState.MENU;

  /** Game statistics */
  private stats: GameStats = {
    score: 0,
    lives: GameConstants.PLAYER_LIVES,
    level: 1,
    wordsCompleted: 0,
    wordsLost: 0,
    accuracy: 0,
    totalCharactersTyped: 0,
    correctCharacters: 0,
    timeElapsed: 0,
  };

  /** Word spawner reference */
  private wordSpawner?: WordSpawner;

  /** Game start time */
  private gameStartTime: number = 0;

  /** Callbacks for state changes */
  public onStateChanged?: (newState: GameState, oldState: GameState) => void;
  public onStatsUpdated?: (stats: GameStats) => void;
  public onGameOver?: (finalStats: GameStats) => void;
  public onLevelComplete?: (level: number, stats: GameStats) => void;

  constructor() {
    this.reset();
  }

  /**
   * Initialize the game with required systems
   */
  public init(gameContainer: Container): void {
    this.wordSpawner = new WordSpawner(gameContainer);
    this.wordSpawner.onWordCompleted = this.handleWordCompleted.bind(this);
    this.wordSpawner.onWordReachedEdge = this.handleWordReachedEdge.bind(this);
  }

  /**
   * Start a new game
   */
  public startGame(): void {
    this.reset();
    this.setState(GameState.PLAYING);
    this.gameStartTime = Date.now();

    if (this.wordSpawner) {
      this.wordSpawner.setDifficulty("easy");
      this.wordSpawner.startSpawning();
    }
  }

  /**
   * Pause the game
   */
  public pauseGame(): void {
    if (this.currentState === GameState.PLAYING) {
      this.setState(GameState.PAUSED);
      this.wordSpawner?.stopSpawning();
    }
  }

  /**
   * Resume the game
   */
  public resumeGame(): void {
    if (this.currentState === GameState.PAUSED) {
      this.setState(GameState.PLAYING);
      this.wordSpawner?.startSpawning();
    }
  }

  /**
   * End the game
   */
  public endGame(): void {
    this.setState(GameState.GAME_OVER);
    this.wordSpawner?.stopSpawning();
    this.wordSpawner?.clearAllWords();

    if (this.onGameOver) {
      this.onGameOver(this.getStats());
    }
  }

  /**
   * Update game state and time
   */
  public update(deltaTime: number): void {
    if (this.currentState !== GameState.PLAYING) return;

    // Update elapsed time
    this.stats.timeElapsed = (Date.now() - this.gameStartTime) / 1000;

    // Update word spawner
    this.wordSpawner?.update(deltaTime);

    // Check level progression
    this.checkLevelProgression();

    // Trigger stats update
    if (this.onStatsUpdated) {
      this.onStatsUpdated(this.getStats());
    }
  }

  /**
   * Handle character typed correctly
   */
  public handleCorrectCharacter(): void {
    this.stats.correctCharacters++;
    this.stats.totalCharactersTyped++;
    this.updateAccuracy();
    this.addScore(GameConstants.POINTS_PER_LETTER);
  }

  /**
   * Handle character typed incorrectly
   */
  public handleIncorrectCharacter(): void {
    this.stats.totalCharactersTyped++;
    this.updateAccuracy();
  }

  /**
   * Handle word completion
   */
  private handleWordCompleted(word: Word): void {
    this.stats.wordsCompleted++;
    this.addScore(GameConstants.POINTS_PER_WORD);

    // Bonus points for longer words
    const wordLength = word.targetText.length;
    if (wordLength > 8) {
      this.addScore(
        Math.floor(
          GameConstants.POINTS_PER_WORD * GameConstants.BONUS_MULTIPLIER,
        ),
      );
    }
  }

  /**
   * Handle word reaching edge
   */
  private handleWordReachedEdge(_word: Word): void {
    this.stats.wordsLost++;
    this.loseLife();
  }

  /**
   * Add score points
   */
  private addScore(points: number): void {
    this.stats.score += points;
  }

  /**
   * Lose a life
   */
  private loseLife(): void {
    this.stats.lives--;

    if (this.stats.lives <= 0) {
      this.endGame();
    }
  }

  /**
   * Update accuracy calculation
   */
  private updateAccuracy(): void {
    if (this.stats.totalCharactersTyped === 0) {
      this.stats.accuracy = 0;
    } else {
      this.stats.accuracy =
        (this.stats.correctCharacters / this.stats.totalCharactersTyped) * 100;
    }
  }

  /**
   * Check if level should progress
   */
  private checkLevelProgression(): void {
    const wordsNeededForNextLevel = this.stats.level * 10;

    if (this.stats.wordsCompleted >= wordsNeededForNextLevel) {
      this.progressToNextLevel();
    }
  }

  /**
   * Progress to next level
   */
  private progressToNextLevel(): void {
    this.stats.level++;

    // Increase difficulty
    if (this.wordSpawner) {
      if (this.stats.level <= 3) {
        this.wordSpawner.setDifficulty("easy");
      } else if (this.stats.level <= 6) {
        this.wordSpawner.setDifficulty("medium");
      } else {
        this.wordSpawner.setDifficulty("hard");
      }

      // Increase spawn rate
      const newInterval = Math.max(
        1000,
        GameConstants.WORD_SPAWN_INTERVAL - this.stats.level * 200,
      );
      this.wordSpawner.setSpawnInterval(newInterval);
    }

    if (this.onLevelComplete) {
      this.onLevelComplete(this.stats.level, this.getStats());
    }
  }

  /**
   * Set game state
   */
  private setState(newState: GameState): void {
    const oldState = this.currentState;
    this.currentState = newState;

    if (this.onStateChanged) {
      this.onStateChanged(newState, oldState);
    }
  }

  /**
   * Reset all game stats
   */
  public reset(): void {
    this.stats = {
      score: 0,
      lives: GameConstants.PLAYER_LIVES,
      level: 1,
      wordsCompleted: 0,
      wordsLost: 0,
      accuracy: 0,
      totalCharactersTyped: 0,
      correctCharacters: 0,
      timeElapsed: 0,
    };

    this.gameStartTime = 0;
    this.wordSpawner?.clearAllWords();
  }

  /**
   * Get current game stats
   */
  public getStats(): GameStats {
    return { ...this.stats };
  }

  /**
   * Get current game state
   */
  public getState(): GameState {
    return this.currentState;
  }

  /**
   * Get word spawner reference
   */
  public getWordSpawner(): WordSpawner | undefined {
    return this.wordSpawner;
  }

  /**
   * Check if game is currently active
   */
  public isGameActive(): boolean {
    return this.currentState === GameState.PLAYING;
  }

  /**
   * Get time remaining for current level (if applicable)
   */
  public getTimeRemaining(): number {
    // Could be used for time-based levels
    return 0;
  }

  /**
   * Get progress to next level (0-1)
   */
  public getLevelProgress(): number {
    const wordsNeededForNextLevel = this.stats.level * 10;
    return Math.min(this.stats.wordsCompleted / wordsNeededForNextLevel, 1);
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.wordSpawner?.destroy();
  }
}
