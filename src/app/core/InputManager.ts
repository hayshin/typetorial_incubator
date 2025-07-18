/**
 * Manages keyboard input for typing game
 * Handles Russian keyboard layout and provides typing events
 */
export class InputManager {
  /** Callback for when a valid character is typed */
  public onCharacterTyped?: (char: string) => void;

  /** Callback for when enter is pressed */
  public onEnter?: () => void;

  /** Callback for when escape is pressed */
  public onEscape?: () => void;

  /** Whether input is currently enabled */
  private isEnabled: boolean = true;

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
    // Allow all printable characters (length 1) except control characters
    return char.length === 1 && char.charCodeAt(0) >= 32;
  }

  /**
   * Check if key should be handled by the game
   */
  private isGameKey(key: string): boolean {
    return this.isValidCharacter(key) || key === "Enter" || key === "Escape";
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
