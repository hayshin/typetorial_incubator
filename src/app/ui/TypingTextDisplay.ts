import { Container } from "pixi.js";
import { GameConstants } from "../data/GameConstants";
import { Label } from "./Label";

/**
 * Component for displaying text that needs to be typed in level 3
 * Shows the full text with typed characters in different colors
 */
export class TypingTextDisplay extends Container {
  /** The full text to be typed */
  private fullText: string = "";

  /** Current typed text */
  private typedText: string = "";

  /** Label for displaying the text */
  private textLabel: Label;

  /** Background container for styling */
  private background: Container;

  constructor() {
    super();

    // Create background container
    this.background = new Container();
    this.addChild(this.background);

    // Create text label
    this.textLabel = new Label({
      text: "",
      style: {
        fontSize: 24,
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: 800,
        align: "left",
      },
    });
    this.textLabel.anchor.set(0, 0.5); // Left-aligned, vertically centered
    this.addChild(this.textLabel);

    this.updateDisplay();
  }

  /**
   * Set the text to be typed
   */
  public setText(text: string): void {
    this.fullText = text;
    this.typedText = "";
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
      this.updateDisplay();
      return true;
    }

    return false;
  }

  /**
   * Remove last character (backspace)
   */
  public backspace(): void {
    if (this.typedText.length > 0) {
      this.typedText = this.typedText.slice(0, -1);
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
      this.textLabel.text = "";
      return;
    }

    // Create rich text with different colors for typed/untyped parts
    const typedPart = this.typedText;
    const untypedPart = this.fullText.slice(this.typedText.length);

    // For now, just show plain text (rich text styling can be added later)
    this.textLabel.text = `${typedPart}${untypedPart}`;

    // Change style based on typing state
    if (this.typedText.length === this.fullText.length) {
      this.textLabel.style.fill = 0x00ff00; // Green when completed
    } else {
      this.textLabel.style.fill = 0xffffff; // White for normal text
    }
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
