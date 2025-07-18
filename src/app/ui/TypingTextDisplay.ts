import { Container, HTMLText } from "pixi.js";
import { GameConstants } from "../data/GameConstants";

/**
 * Component for displaying text that needs to be typed in level 3
 * Shows the full text with typed characters in different colors
 */
export class TypingTextDisplay extends Container {
  /** The full text to be typed */
  private fullText: string = "";

  /** Current typed text */
  private typedText: string = "";

  /** HTML text for displaying the text with colors */
  private textDisplay: HTMLText;

  /** Whether the current character is wrong */
  private hasWrongCharacter: boolean = false;

  /** Background container for styling */
  private background: Container;

  constructor() {
    super();

    // Create background container
    this.background = new Container();
    this.addChild(this.background);

    // Create text display with HTML support for colors
    this.textDisplay = new HTMLText({
      text: "",
      style: {
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: 800,
        align: "left",
      },
    });
    this.textDisplay.anchor.set(0, 0.5); // Left-aligned, vertically centered
    this.addChild(this.textDisplay);

    this.updateDisplay();
  }

  /**
   * Set the text to be typed
   */
  public setText(text: string): void {
    this.fullText = text;
    this.typedText = "";
    this.hasWrongCharacter = false;
    this.updateDisplay();
  }

  /**
   * Add a character to the typed text
   */
  public typeCharacter(char: string): boolean {
    const nextExpectedChar = this.getNextExpectedCharacter();

    if (
      nextExpectedChar &&
      nextExpectedChar.toLowerCase() === char.toLowerCase()
    ) {
      this.typedText += nextExpectedChar; // Use the original case from the text
      this.hasWrongCharacter = false;
      this.updateDisplay();
      return true;
    }

    this.hasWrongCharacter = true;
    this.updateDisplay();
    return false;
  }

  /**
   * Remove last character (backspace)
   */
  public backspace(): void {
    if (this.typedText.length > 0) {
      this.typedText = this.typedText.slice(0, -1);
      this.hasWrongCharacter = false;
      this.updateDisplay();
    }
  }

  /**
   * Get the next character that should be typed
   */
  public getNextExpectedCharacter(): string | null {
    if (this.typedText.length < this.fullText.length) {
      return this.fullText[this.typedText.length];
    }
    return null;
  }

  /**
   * Check if the current word is completed (next character is space or end)
   */
  public isCurrentWordCompleted(): boolean {
    const nextChar = this.getNextExpectedCharacter();
    return nextChar === " " || nextChar === null;
  }

  /**
   * Get the current word being typed
   */
  public getCurrentWord(): string {
    // Find the last space in typed text
    const lastSpaceIndex = this.typedText.lastIndexOf(" ");
    const wordStart = lastSpaceIndex === -1 ? 0 : lastSpaceIndex + 1;

    // Find the next space or end of text
    let wordEnd = this.fullText.indexOf(" ", wordStart);
    if (wordEnd === -1) {
      wordEnd = this.fullText.length;
    }

    return this.fullText.slice(wordStart, wordEnd);
  }

  /**
   * Complete the current word (called when space is pressed)
   */
  public completeCurrentWord(): string | null {
    if (!this.isCurrentWordCompleted()) {
      return null;
    }

    const currentWord = this.getCurrentWord();

    // If next character is space, include it in typed text
    if (this.getNextExpectedCharacter() === " ") {
      this.typedText += " ";
      this.updateDisplay();
    }

    return currentWord;
  }

  /**
   * Check if all text is completed
   */
  public isCompleted(): boolean {
    return this.typedText.length === this.fullText.length;
  }

  /**
   * Get typing progress (0-1)
   */
  public getProgress(): number {
    if (this.fullText.length === 0) return 1;
    return this.typedText.length / this.fullText.length;
  }

  /**
   * Update the visual display
   */
  private updateDisplay(): void {
    if (this.fullText.length === 0) {
      this.textDisplay.text = "";
      return;
    }

    // Create HTML text with different colors
    const typedPart = this.typedText;
    const remainingText = this.fullText.slice(this.typedText.length);

    let htmlText = "";

    // Typed characters in gray
    if (typedPart.length > 0) {
      htmlText += `<span style="color: #888888">${this.escapeHtml(typedPart)}</span>`;
    }

    // Remaining text
    if (remainingText.length > 0) {
      const nextChar = remainingText[0];
      const restOfText = remainingText.slice(1);

      // Next character - red if wrong, white if normal
      const nextCharColor = this.hasWrongCharacter ? "#ff0000" : "#ffffff";
      htmlText += `<span style="color: ${nextCharColor}">${this.escapeHtml(nextChar)}</span>`;

      // Rest of the text in white
      if (restOfText.length > 0) {
        htmlText += `<span style="color: #ffffff">${this.escapeHtml(restOfText)}</span>`;
      }
    }

    this.textDisplay.text = htmlText;
  }

  /**
   * Escape HTML characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Position the display
   */
  public resize(width: number, height: number): void {
    this.x = -width * 0.4; // Position to the left of center
    this.y = GameConstants.TYPING_TEXT_Y;
  }

  /**
   * Reset the display
   */
  public reset(): void {
    this.fullText = "";
    this.typedText = "";
    this.hasWrongCharacter = false;
    this.updateDisplay();
  }

  /**
   * Get remaining text
   */
  public getRemainingText(): string {
    return this.fullText.slice(this.typedText.length);
  }

  /**
   * Get typed text
   */
  public getTypedText(): string {
    return this.typedText;
  }
}
