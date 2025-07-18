/**
 * Manager for Level 3 texts - handles boss battle typing texts
 */

import level3Texts from "./level3-texts.json";

export interface Level3Text {
  text: string;
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
   * Get all texts
   */
  public static getAllTexts(): Level3Text[] {
    return [...Level3TextManager.texts];
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
}
