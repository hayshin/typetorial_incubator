/**
 * Dictionary of Russian words for the typing game
 * Words are categorized by difficulty level
 */

export interface WordEntry {
  text: string;
  difficulty: "easy" | "medium" | "hard";
}

export class WordDictionary {
  private static readonly words: WordEntry[] = [
    // Easy words (3-5 letters)
    { text: "дом", difficulty: "easy" },
    { text: "кот", difficulty: "easy" },
    { text: "лес", difficulty: "easy" },
    { text: "море", difficulty: "easy" },
    { text: "небо", difficulty: "easy" },
    { text: "рука", difficulty: "easy" },
    { text: "нога", difficulty: "easy" },
    { text: "глаз", difficulty: "easy" },
    { text: "нос", difficulty: "easy" },
    { text: "рот", difficulty: "easy" },
    { text: "ухо", difficulty: "easy" },
    { text: "мама", difficulty: "easy" },
    { text: "папа", difficulty: "easy" },
    { text: "вода", difficulty: "easy" },
    { text: "хлеб", difficulty: "easy" },
    { text: "молоко", difficulty: "easy" },

    // Medium words (6-8 letters)
    { text: "собака", difficulty: "medium" },
    { text: "кошка", difficulty: "medium" },
    { text: "машина", difficulty: "medium" },
    { text: "дорога", difficulty: "medium" },
    { text: "школа", difficulty: "medium" },
    { text: "работа", difficulty: "medium" },
    { text: "учитель", difficulty: "medium" },
    { text: "студент", difficulty: "medium" },
    { text: "компьютер", difficulty: "medium" },
    { text: "телефон", difficulty: "medium" },
    { text: "квартира", difficulty: "medium" },
    { text: "магазин", difficulty: "medium" },
    { text: "больница", difficulty: "medium" },
    { text: "ресторан", difficulty: "medium" },
    { text: "библиотека", difficulty: "medium" },

    // Hard words (9+ letters)
    { text: "программист", difficulty: "hard" },
    { text: "университет", difficulty: "hard" },
    { text: "путешествие", difficulty: "hard" },
    { text: "приключение", difficulty: "hard" },
    { text: "воображение", difficulty: "hard" },
    { text: "представление", difficulty: "hard" },
    { text: "правительство", difficulty: "hard" },
    { text: "международный", difficulty: "hard" },
    { text: "образование", difficulty: "hard" },
    { text: "окружающий", difficulty: "hard" },
    { text: "невероятный", difficulty: "hard" },
    { text: "замечательный", difficulty: "hard" },
    { text: "превосходный", difficulty: "hard" },
    { text: "удивительный", difficulty: "hard" },
    { text: "фантастический", difficulty: "hard" },
  ];

  /**
   * Get a random word by difficulty
   */
  public static getRandomWord(difficulty?: "easy" | "medium" | "hard"): string {
    let filteredWords = WordDictionary.words;

    if (difficulty) {
      filteredWords = WordDictionary.words.filter(
        (word) => word.difficulty === difficulty,
      );
    }

    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    return filteredWords[randomIndex].text;
  }

  /**
   * Get multiple random words
   */
  public static getRandomWords(
    count: number,
    difficulty?: "easy" | "medium" | "hard",
  ): string[] {
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
      words.push(WordDictionary.getRandomWord(difficulty));
    }
    return words;
  }

  /**
   * Get all words of specific difficulty
   */
  public static getWordsByDifficulty(
    difficulty: "easy" | "medium" | "hard",
  ): string[] {
    return WordDictionary.words
      .filter((word) => word.difficulty === difficulty)
      .map((word) => word.text);
  }

  /**
   * Check if a word exists in dictionary
   */
  public static isValidWord(text: string): boolean {
    return WordDictionary.words.some(
      (word) => word.text.toLowerCase() === text.toLowerCase(),
    );
  }

  /**
   * Get word difficulty
   */
  public static getWordDifficulty(
    text: string,
  ): "easy" | "medium" | "hard" | null {
    const word = WordDictionary.words.find(
      (word) => word.text.toLowerCase() === text.toLowerCase(),
    );
    return word ? word.difficulty : null;
  }
}
