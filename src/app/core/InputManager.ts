/**
 * Manages keyboard input for typing game
 * Handles Russian keyboard layout and provides typing events
 */
export class InputManager {
  /** Current input buffer */
  private currentInput: string = "";

  /** Callback for when a valid character is typed */
  public onCharacterTyped?: (char: string) => void;

  /** Callback for when backspace is pressed */
  public onBackspace?: () => void;

  /** Callback for when enter is pressed */
  public onEnter?: () => void;

  /** Callback for when input is cleared */
  public onInputCleared?: () => void;

  /** Whether input is currently enabled */
  private isEnabled: boolean = true;

  /** Set of valid Russian characters */
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
      this.handleBackspace();
      return;
    }

    if (key === "enter") {
      this.handleEnter();
      return;
    }

    if (key === "escape") {
      this.clearInput();
      return;
    }

    // Handle character input
    if (this.isValidCharacter(key)) {
      this.addCharacter(key);
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
   * Add character to current input
   */
  private addCharacter(char: string): void {
    const lowerChar = char.toLowerCase();
    this.currentInput += lowerChar;

    // Trigger character typed event
    if (this.onCharacterTyped) {
      this.onCharacterTyped(lowerChar);
    }
  }

  /**
   * Handle backspace key
   */
  private handleBackspace(): void {
    if (this.currentInput.length > 0) {
      this.currentInput = this.currentInput.slice(0, -1);

      if (this.onBackspace) {
        this.onBackspace();
      }
    }
  }

  /**
   * Handle enter key
   */
  private handleEnter(): void {
    if (this.onEnter) {
      this.onEnter();
    }
  }

  /**
   * Clear current input
   */
  public clearInput(): void {
    this.currentInput = "";

    if (this.onInputCleared) {
      this.onInputCleared();
    }
  }

  /**
   * Get current input string
   */
  public getCurrentInput(): string {
    return this.currentInput;
  }

  /**
   * Set current input (useful for testing or manual input)
   */
  public setCurrentInput(input: string): void {
    this.currentInput = input.toLowerCase();
  }

  /**
   * Enable or disable input handling
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;

    if (!enabled) {
      this.clearInput();
    }
  }

  /**
   * Check if input is enabled
   */
  public isInputEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get the last typed character
   */
  public getLastCharacter(): string | null {
    if (this.currentInput.length === 0) return null;
    return this.currentInput[this.currentInput.length - 1];
  }

  /**
   * Remove event listeners (cleanup)
   */
  public destroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }

  /**
   * Check if current input matches the beginning of target text
   */
  public matchesText(targetText: string): boolean {
    if (!targetText || !this.currentInput) return false;
    return targetText.toLowerCase().startsWith(this.currentInput);
  }

  /**
   * Get typing progress for a target text (0 to 1)
   */
  public getProgress(targetText: string): number {
    if (!targetText) return 0;
    return Math.min(this.currentInput.length / targetText.length, 1);
  }

  /**
   * Check if input completely matches target text
   */
  public isComplete(targetText: string): boolean {
    return this.currentInput === targetText.toLowerCase();
  }
}
