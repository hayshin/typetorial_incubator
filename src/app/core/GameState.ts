/**
 * Global game state holder for sharing data between screens
 * Used to pass game information like final score to different screens
 */
export class GameState {
  /** Final score from the last game */
  private static finalScore: number = 0;

  /** Whether the game just ended */
  private static justEnded: boolean = false;

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
   * Reset all state
   */
  public static reset(): void {
    GameState.finalScore = 0;
    GameState.justEnded = false;
  }
}
