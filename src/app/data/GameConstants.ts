/**
 * Game constants and configuration values
 */

export class GameConstants {
  // Word movement
  public static readonly WORD_SPEED = 100; // pixels per second
  public static readonly WORD_SPAWN_INTERVAL = 2000; // milliseconds
  public static readonly WORD_SPAWN_Y_RANGE = { min: 100, max: 500 }; // Y position range

  // Screen dimensions
  public static readonly GAME_WIDTH = 1024;
  public static readonly GAME_HEIGHT = 768;
  public static readonly WORD_SPAWN_X = 900; // Right edge spawn position
  public static readonly WORD_DESTROY_X = -100; // Left edge destroy position

  // Player settings
  public static readonly PLAYER_LIVES = 3;
  public static readonly PLAYER_X = 100; // Player position on left side
  public static readonly MONSTER_X = 800; // Monster position on right side

  // Typing settings
  public static readonly TYPING_HIGHLIGHT_COLOR = 0x00ff00; // Green for correct letters
  public static readonly TYPING_ERROR_COLOR = 0xff0000; // Red for wrong letters
  public static readonly TYPING_DEFAULT_COLOR = 0xffffff; // White for untyped letters

  // Bullet settings
  public static readonly BULLET_SPEED = 300; // pixels per second
  public static readonly BULLET_SIZE = 8;
  public static readonly BULLET_COLOR = 0xffff00; // Yellow bullets

  // Scoring
  public static readonly POINTS_PER_LETTER = 10;
  public static readonly POINTS_PER_WORD = 100;
  public static readonly BONUS_MULTIPLIER = 1.5;

  // Game difficulty progression
  public static readonly DIFFICULTY_LEVELS = {
    EASY: {
      wordSpeed: 80,
      spawnInterval: 3000,
      wordDifficulty: "easy" as const,
    },
    MEDIUM: {
      wordSpeed: 120,
      spawnInterval: 2000,
      wordDifficulty: "medium" as const,
    },
    HARD: {
      wordSpeed: 160,
      spawnInterval: 1500,
      wordDifficulty: "hard" as const,
    },
  };

  // Animation durations
  public static readonly FADE_IN_DURATION = 0.3;
  public static readonly FADE_OUT_DURATION = 0.2;
  public static readonly BULLET_TRAVEL_DURATION = 0.5;
  public static readonly WORD_DESTROY_ANIMATION = 0.3;

  // Colors
  public static readonly COLORS = {
    BACKGROUND: 0x1a1a2e,
    PLAYER: 0x16537e,
    MONSTER: 0x8b2635,
    UI_PRIMARY: 0xec1561,
    UI_SECONDARY: 0x0f3460,
    TEXT_PRIMARY: 0xffffff,
    TEXT_SECONDARY: 0xaaaaaa,
  };
}
