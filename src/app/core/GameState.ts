import { GameConstants } from "../data/GameConstants";

/**
 * Global game state holder for sharing data between screens
 * Used to pass game information like final score to different screens
 */
export class GameState {
  /** Final score from the last game */
  private static finalScore: number = 0;

  /** Whether the game just ended */
  private static justEnded: boolean = false;

  /** Current level (1, 2, or 3) */
  private static currentLevel: 1 | 2 | 3 = 1;

  /** Current progress within the level (0-100) */
  private static levelProgress: number = 0;

  /** Whether we're transitioning to a new level */
  private static transitioningToLevel: number | null = null;

  /**
   * Set the final score when game ends
   */
  public static setFinalScore(score: number): void {
    GameState.finalScore = score;
    GameState.justEnded = true;
  }

  /**
   * Get the final score
   */
  public static getFinalScore(): number {
    return GameState.finalScore;
  }

  /**
   * Check if game just ended
   */
  public static hasJustEnded(): boolean {
    return GameState.justEnded;
  }

  /**
   * Mark that the game state has been consumed
   */
  public static consume(): void {
    GameState.justEnded = false;
  }

  /**
   * Get current level
   */
  public static getCurrentLevel(): 1 | 2 | 3 {
    return GameState.currentLevel;
  }

  /**
   * Set current level
   */
  public static setCurrentLevel(level: 1 | 2 | 3): void {
    GameState.currentLevel = level;
  }

  /**
   * Get level progress
   */
  public static getLevelProgress(): number {
    return GameState.levelProgress;
  }

  /**
   * Set level progress
   */
  public static setLevelProgress(progress: number): void {
    GameState.levelProgress = Math.max(0, Math.min(100, progress));
  }

  /**
   * Start transition to next level
   */
  public static startLevelTransition(nextLevel: 1 | 2 | 3): void {
    console.log("GameState - startLevelTransition to:", nextLevel);
    GameState.transitioningToLevel = nextLevel;
  }

  /**
   * Get the level we're transitioning to
   */
  public static getTransitioningToLevel(): number | null {
    console.log(
      "GameState - getTransitioningToLevel returning:",
      GameState.transitioningToLevel,
    );
    return GameState.transitioningToLevel;
  }

  /**
   * Complete level transition
   */
  public static completeLevelTransition(): void {
    console.log(
      "GameState - completeLevelTransition called, transitioningToLevel:",
      GameState.transitioningToLevel,
    );
    if (GameState.transitioningToLevel !== null) {
      GameState.currentLevel = GameState.transitioningToLevel as 1 | 2 | 3;
      console.log("GameState - level changed to:", GameState.currentLevel);
      GameState.transitioningToLevel = null;
      GameState.levelProgress = 0;
    }
  }

  /**
   * Check if we're currently transitioning between levels
   */
  public static isTransitioning(): boolean {
    return GameState.transitioningToLevel !== null;
  }

  /**
   * Reset all state
   */
  public static reset(): void {
    console.log("GameState - reset called");
    GameState.finalScore = 0;
    GameState.justEnded = false;
    GameState.currentLevel = 1;
    GameState.levelProgress = 0;
    GameState.transitioningToLevel = null;
  }
}
