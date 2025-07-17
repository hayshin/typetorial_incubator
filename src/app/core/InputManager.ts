/**
 * Manages keyboard input for typing game
 * Handles Russian keyboard layout and provides typing events
 */
export class InputManager {
  /** Callback for when a valid character is typed */
  public onCharacterTyped?: (char: string) => void;

  /** Callback for when backspace is pressed */
  public onBackspace?: () => void;

  /** Callback for when enter is pressed */
  public onEnter?: () => void;

  /** Callback for when escape is pressed */
  public onEscape?: () => void;

  /** Whether input is currently enabled */
  private isEnabled: boolean = true;

  /** Set of valid Russian characters and common punctuation */
  private readonly validChars = new Set([
    "а",
    "б",
    "в",
    "г",
    "д",
    "е",
    "ё",
    "ж",
    "з",
    "и",
    "й",
    "к",
    "л",
    "м",
    "н",
    "о",
    "п",
    "р",
    "с",
    "т",
    "у",
    "ф",
    "х",
    "ц",
    "ч",
    "ш",
    "щ",
    "ъ",
    "ы",
    "ь",
    "э",
    "ю",
    "я",
    " ", // space
    ".", // period
    ",", // comma
    "?", // question mark
    "!", // exclamation mark
    "-", // dash
    ":", // colon
    ";", // semicolon
  ]);

  constructor() {
    this.setupKeyboardListeners();
  }

  /**
   * Setup keyboard event listeners
   */
  private setupKeyboardListeners(): void {
    // Listen for keydown events
    window.addEventListener("keydown", this.handleKeyDown.bind(this));

    // Prevent default behavior for game keys
    window.addEventListener("keydown", (event) => {
      if (this.isGameKey(event.key)) {
        event.preventDefault();
      }
    });
  }

  /**
   * Handle keydown events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    const key = event.key.toLowerCase();

    // Handle special keys
    if (key === "backspace") {
      if (this.onBackspace) {
        this.onBackspace();
      }
      return;
    }

    if (key === "enter") {
      if (this.onEnter) {
        this.onEnter();
      }
      return;
    }

    if (key === "escape") {
      if (this.onEscape) {
        this.onEscape();
      }
      return;
    }

    // Handle character input
    if (this.isValidCharacter(key)) {
      if (this.onCharacterTyped) {
        this.onCharacterTyped(key);
      }
    }
  }

  /**
   * Check if character is valid for typing
   */
  private isValidCharacter(char: string): boolean {
    return this.validChars.has(char.toLowerCase());
  }

  /**
   * Check if key should be handled by the game
   */
  private isGameKey(key: string): boolean {
    return (
      this.isValidCharacter(key) ||
      key === "Backspace" ||
      key === "Enter" ||
      key === "Escape"
    );
  }

  /**
   * Enable or disable input handling
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if input is enabled
   */
  public isInputEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Remove event listeners (cleanup)
   */
  public destroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }
}
