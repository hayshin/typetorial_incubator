import { resize } from "../../engine/resize/resize.ts";

/**
 * Game constants and configuration values
 */
export class GameConstants {
  // Base design dimensions
  private static readonly BASE_WIDTH = 1024;
  private static readonly BASE_HEIGHT = 768;
  private static readonly MARGIN = 50;

  // Get current game dimensions
  public static getGameSize() {
    const { width, height } = resize(
      window.innerWidth - GameConstants.MARGIN * 2,
      window.innerHeight - GameConstants.MARGIN * 2,
      GameConstants.BASE_WIDTH,
      GameConstants.BASE_HEIGHT,
      true,
    );
    return { width, height };
  }

  // Screen dimensions (dynamic)
  public static get GAME_WIDTH() {
    return GameConstants.getGameSize().width;
  }

  public static get GAME_HEIGHT() {
    return GameConstants.getGameSize().height;
  }

  public static get WORD_SPAWN_X() {
    return GameConstants.GAME_WIDTH / 2 - GameConstants.MARGIN;
  }

  public static get WORD_DESTROY_X() {
    return -GameConstants.GAME_WIDTH / 2 - GameConstants.MARGIN;
  }

  public static get PLAYER_X() {
    return -GameConstants.GAME_WIDTH / 2 + GameConstants.MARGIN + 50;
  }

  public static get MONSTER_X() {
    return GameConstants.GAME_WIDTH / 2 - GameConstants.MARGIN - 100;
  }

  public static get SPEAKER_X() {
    return GameConstants.GAME_WIDTH / 2 - GameConstants.MARGIN - 50;
  }

  public static get SPEAKER_Y() {
    return 0; // Center vertically
  }

  // Level 3 constants
  public static get TYPING_TEXT_Y() {
    return GameConstants.GAME_HEIGHT / 2 - GameConstants.MARGIN - 100;
  }

  public static get PLAYER_MESSAGE_SPAWN_X() {
    return GameConstants.PLAYER_X + 50; // Slightly to the right of player
  }

  public static get PLAYER_MESSAGE_SPAWN_Y() {
    return 0; // Center vertically
  }

  public static get WORD_SPAWN_Y_RANGE() {
    return {
      min: -GameConstants.GAME_HEIGHT / 2 + GameConstants.MARGIN,
      max: GameConstants.GAME_HEIGHT / 2 - GameConstants.MARGIN,
    };
  }

  // Fixed constants
  public static readonly WORD_SPEED = 100;
  public static readonly WORD_SPAWN_INTERVAL = 3000;
  public static readonly PLAYER_LIVES = 3;

  // Game configuration
  public static readonly DEFAULT_LEVEL: 1 | 2 | 3 = 1;

  // Typing settings
  public static readonly TYPING_TYPED_COLOR = 0x888888;
  public static readonly TYPING_ERROR_COLOR = 0xff0000;
  public static readonly TYPING_DEFAULT_COLOR = 0xffffff;

  // Bullet settings
  public static readonly BULLET_SPEED = 1500;
  public static readonly BULLET_SIZE = 8;
  public static readonly BULLET_COLOR = 0xffff00;

  // Message display settings
  public static readonly MESSAGE_MAX_WIDTH = 300; // Max width in pixels for message wrapping
  public static readonly MESSAGE_FONT_SIZE = 28;
  public static readonly MESSAGE_MAX_CHARS_PER_LINE = 20; // Roughly 20 characters per line

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

  // Typography
  public static readonly FONT_FAMILY =
    "'San Francisco', Helvetica, Arial, sans-serif";

  // Default text styles
  public static readonly TEXT_STYLES = {
    DEFAULT: {
      fontFamily: GameConstants.FONT_FAMILY,
      fontSize: 16,
      fill: GameConstants.COLORS.TEXT_PRIMARY,
    },
    LARGE: {
      fontFamily: GameConstants.FONT_FAMILY,
      fontSize: 24,
      fill: GameConstants.COLORS.TEXT_PRIMARY,
    },
    SMALL: {
      fontFamily: GameConstants.FONT_FAMILY,
      fontSize: 14,
      fill: GameConstants.COLORS.TEXT_SECONDARY,
    },
    BUTTON: {
      fontFamily: GameConstants.FONT_FAMILY,
      fontSize: 18,
      fill: GameConstants.COLORS.TEXT_PRIMARY,
    },
  };
}
