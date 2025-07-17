/**
 * Manager for Level 3 texts - handles boss battle typing texts
 */

import level3Texts from "./level3-texts.json";

export interface Level3Text {
  text: string;
  difficulty: "easy" | "medium" | "hard";
}

export class Level3TextManager {
  private static texts: Level3Text[] = level3Texts as Level3Text[];

  /**
   * Get a random text for boss battle
   */
  public static getRandomText(): Level3Text {
    const randomIndex = Math.floor(
      Math.random() * Level3TextManager.texts.length,
    );
    return Level3TextManager.texts[randomIndex];
  }

  /**
   * Get a random text by difficulty
   */
  public static getRandomTextByDifficulty(
    difficulty: "easy" | "medium" | "hard",
  ): Level3Text {
    const filteredTexts = Level3TextManager.texts.filter(
      (text) => text.difficulty === difficulty,
    );

    if (filteredTexts.length === 0) {
      // Fallback to any text if no texts for this difficulty
      return Level3TextManager.getRandomText();
    }

    const randomIndex = Math.floor(Math.random() * filteredTexts.length);
    return filteredTexts[randomIndex];
  }

  /**
   * Get all texts
   */
  public static getAllTexts(): Level3Text[] {
    return [...Level3TextManager.texts];
  }

  /**
   * Get texts by difficulty
   */
  public static getTextsByDifficulty(
    difficulty: "easy" | "medium" | "hard",
  ): Level3Text[] {
    return Level3TextManager.texts.filter(
      (text) => text.difficulty === difficulty,
    );
  }

  /**
   * Calculate boss health based on text length
   */
  public static calculateBossHealth(text: string): number {
    // Boss health = number of characters in text
    return text.length;
  }

  /**
   * Calculate damage based on word length
   */
  public static calculateWordDamage(word: string): number {
    // Damage = word length * multiplier
    return word.length * 2;
  }

  /**
   * Get total text count
   */
  public static getTextCount(): number {
    return Level3TextManager.texts.length;
  }

  /**
   * Get text count by difficulty
   */
  public static getTextCountByDifficulty(
    difficulty: "easy" | "medium" | "hard",
  ): number {
    return Level3TextManager.texts.filter(
      (text) => text.difficulty === difficulty,
    ).length;
  }
}
