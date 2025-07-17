import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { Ticker } from "pixi.js";
import { Container } from "pixi.js";
import { GameState } from "../../core/GameState";
import { InputManager } from "../../core/InputManager";
import { Player } from "../../entities/Player";
import type { Word } from "../../entities/Word";
import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { WordSpawner } from "../../systems/WordSpawner";
import { Label } from "../../ui/Label";
import { GameOverScreen } from "../gameover/GameOverScreen";

/** The screen that holds the app */
export class MainScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  public mainContainer: Container;
  private pauseButton: FancyButton;
  private settingsButton: FancyButton;
  private paused = false;

  // Game components
  private inputManager!: InputManager;
  private wordSpawner!: WordSpawner;
  private gameContainer!: Container;
  private player!: Player;

  // UI elements
  private currentInputDisplay!: Label;
  private scoreDisplay!: Label;
  private livesDisplay!: Label;

  // Game state
  private score: number = 0;
  private lives: number = 3;
  private currentInput: string = "";
  private wrongCharHighlight: boolean = false;

  constructor() {
    super();

    this.mainContainer = new Container();
    this.addChild(this.mainContainer);

    // Initialize game components
    this.initGame();
    this.initUI();

    const buttonAnimations = {
      hover: {
        props: {
          scale: { x: 1.1, y: 1.1 },
        },
        duration: 100,
      },
      pressed: {
        props: {
          scale: { x: 0.9, y: 0.9 },
        },
        duration: 100,
      },
    };
    this.pauseButton = new FancyButton({
      defaultView: "icon-pause.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.pauseButton.onPress.connect(() =>
      engine().navigation.presentPopup(PausePopup),
    );
    this.addChild(this.pauseButton);

    this.settingsButton = new FancyButton({
      defaultView: "icon-settings.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.settingsButton.onPress.connect(() =>
      engine().navigation.presentPopup(SettingsPopup),
    );
    this.addChild(this.settingsButton);
  }

  /** Initialize game components */
  private initGame(): void {
    // Create game container for words
    this.gameContainer = new Container();
    this.mainContainer.addChild(this.gameContainer);

    // Initialize player
    this.player = new Player();
    this.mainContainer.addChild(this.player);

    console.log(`Player initialized at: (${this.player.x}, ${this.player.y})`);
    console.log(`MainContainer will be positioned at center during resize`);

    // Initialize input manager
    this.inputManager = new InputManager();
    this.inputManager.onCharacterTyped = this.handleCharacterTyped.bind(this);
    this.inputManager.onBackspace = this.handleBackspace.bind(this);
    this.inputManager.onEscape = this.handleEscape.bind(this);

    // Initialize word spawner
    this.wordSpawner = new WordSpawner(this.gameContainer);
    this.wordSpawner.onWordReachedEdge = this.handleWordReachedEdge.bind(this);
    this.wordSpawner.onWordCompleted = this.handleWordCompleted.bind(this);
  }

  /** Initialize UI elements */
  private initUI(): void {
    // Current input display
    this.currentInputDisplay = new Label({
      text: "",
      style: {
        fontSize: 24,
        fill: 0x00ff00,
      },
    });
    this.currentInputDisplay.y = 50;
    this.addChild(this.currentInputDisplay);

    // Score display
    this.scoreDisplay = new Label({
      text: `Score: ${this.score}`,
      style: {
        fontSize: 20,
        fill: 0xffffff,
      },
    });
    this.scoreDisplay.y = 80;
    this.addChild(this.scoreDisplay);

    // Lives display
    this.livesDisplay = new Label({
      text: `Lives: ${this.lives}`,
      style: {
        fontSize: 20,
        fill: 0xff0000,
      },
    });
    this.livesDisplay.y = 110;
    this.addChild(this.livesDisplay);
  }

  /** Handle character typed */
  private handleCharacterTyped(char: string): void {
    const lowerChar = char.toLowerCase();
    const activeWord = this.wordSpawner.getActiveWord();

    // If we have an active word, check if this character is correct
    if (activeWord && !activeWord.isCompleted) {
      const expectedChar = activeWord.getNextCharacter();

      if (expectedChar === lowerChar) {
        // Correct character - add to input and process
        this.currentInput += lowerChar;
        this.wrongCharHighlight = false;
        this.updateInputDisplay();
        this.shootBullet();
        this.processActiveWordInput(activeWord, lowerChar);
      } else {
        // Wrong character - just highlight the expected character in red
        this.wrongCharHighlight = true;
        this.updateInputDisplay();
        // Don't add to input, don't shoot bullet, just visual feedback
      }
    } else {
      // No active word - try to find matching word
      const potentialInput = this.currentInput + lowerChar;
      const matchingWord = this.wordSpawner.findMatchingWord(potentialInput);

      if (matchingWord) {
        // Found matching word - add character and activate it
        this.currentInput += lowerChar;
        this.wrongCharHighlight = false;
        this.updateInputDisplay();
        this.wordSpawner.setActiveWord(matchingWord);
        this.player.setTarget(matchingWord);
        this.shootBullet();
        this.processActiveWordInput(matchingWord, lowerChar);
      }
      // If no matching word found, ignore the character
    }
  }

  /** Handle backspace */
  private handleBackspace(): void {
    if (this.currentInput.length > 0) {
      this.currentInput = this.currentInput.slice(0, -1);
      this.wrongCharHighlight = false;
      this.updateInputDisplay();

      // If we cleared all input, deactivate current word
      if (this.currentInput.length === 0) {
        this.wordSpawner.setActiveWord(null);
        this.player.setTarget(null);
      }
    }
  }

  /** Handle escape key */
  private handleEscape(): void {
    this.clearInput();
  }

  /** Clear current input */
  private clearInput(): void {
    this.currentInput = "";
    this.wrongCharHighlight = false;
    this.updateInputDisplay();
    this.wordSpawner.setActiveWord(null);
    this.player.setTarget(null);
  }

  /** Process input for active word */
  private processActiveWordInput(activeWord: Word, char: string): void {
    const success = activeWord.typeCharacter(char);

    if (success && activeWord.isCompleted) {
      // Word completed
      this.handleWordCompleted(activeWord);
    }
  }

  /** Shoot bullet towards active word */
  private shootBullet(): void {
    const activeWord = this.wordSpawner.getActiveWord();
    if (activeWord && !activeWord.isCompleted) {
      console.log(`Active word position: (${activeWord.x}, ${activeWord.y})`);
      console.log(`Player position: (${this.player.x}, ${this.player.y})`);
      console.log(
        `MainContainer position: (${this.mainContainer.x}, ${this.mainContainer.y})`,
      );
      this.player.shootBullet();
    }
  }

  /** Update input display */
  private updateInputDisplay(): void {
    let displayText = `Input: ${this.currentInput}`;

    // Add visual feedback for wrong character
    if (this.wrongCharHighlight) {
      const activeWord = this.wordSpawner.getActiveWord();
      if (activeWord) {
        const expectedChar = activeWord.getNextCharacter();
        displayText += ` (Expected: ${expectedChar})`;
      }
    }

    this.currentInputDisplay.text = displayText;
    // Change color based on wrong character highlight
    this.currentInputDisplay.style.fill = this.wrongCharHighlight
      ? 0xff0000
      : 0x00ff00;
  }

  /** Handle word reaching edge */
  private async handleWordReachedEdge(): Promise<void> {
    this.lives--;
    this.updateLivesDisplay();

    if (this.lives <= 0) {
      await this.gameOver();
    }
  }

  /** Handle word completed */
  private handleWordCompleted(word: Word): void {
    this.score += word.targetText.length * 10;
    this.updateScoreDisplay();

    // Clear input and deactivate word
    this.clearInput();
  }

  /** Update score display */
  private updateScoreDisplay(): void {
    this.scoreDisplay.text = `Score: ${this.score}`;
  }

  /** Update lives display */
  private updateLivesDisplay(): void {
    this.livesDisplay.text = `Lives: ${this.lives}`;
  }

  /** Game over */
  private async gameOver(): Promise<void> {
    this.wordSpawner.stopSpawning();
    this.inputManager.setEnabled(false);

    // Set final score in global state
    GameState.setFinalScore(this.score);

    // Show game over screen
    await engine().navigation.showScreen(GameOverScreen);
  }

  /** Prepare the screen just before showing */
  public prepare() {}

  /** Update the screen */
  public update(time: Ticker) {
    if (this.paused) return;

    // Update word spawner
    this.wordSpawner.update(time.deltaMS / 1000);

    // Update player and bullets
    this.player.update(time.deltaMS / 1000);
  }

  /** Pause gameplay - automatically fired when a popup is presented */
  public async pause() {
    this.mainContainer.interactiveChildren = false;
    this.paused = true;
    this.inputManager.setEnabled(false);
  }

  /** Resume gameplay */
  public async resume() {
    this.mainContainer.interactiveChildren = true;
    this.paused = false;
    this.inputManager.setEnabled(true);
  }

  /** Fully reset */
  public reset() {
    this.score = 0;
    this.lives = 3;
    this.wrongCharHighlight = false;
    this.clearInput();
    this.wordSpawner.clearAllWords();
    this.player.clearBullets();
    this.updateScoreDisplay();
    this.updateLivesDisplay();
    this.inputManager.setEnabled(true);
    GameState.reset();
  }

  /** Resize the screen, fired whenever window size changes */
  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.mainContainer.x = centerX;
    this.mainContainer.y = centerY;

    console.log(
      `Screen resized to ${width}x${height}, mainContainer positioned at (${centerX}, ${centerY})`,
    );
    console.log(`Player local position: (${this.player.x}, ${this.player.y})`);
    this.pauseButton.x = 30;
    this.pauseButton.y = 30;
    this.settingsButton.x = width - 30;
    this.settingsButton.y = 30;

    // Position UI elements
    this.currentInputDisplay.x = 50;
    this.scoreDisplay.x = 50;
    this.livesDisplay.x = 50;
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

    const elementsToAnimate = [
      this.pauseButton,
      this.settingsButton,
      // this.addButton,
      // this.removeButton,
    ];

    let finalPromise!: AnimationPlaybackControls;
    for (const element of elementsToAnimate) {
      element.alpha = 0;
      finalPromise = animate(
        element,
        { alpha: 1 },
        { duration: 0.3, delay: 0.75, ease: "backOut" },
      );
    }

    await finalPromise;

    // Start the game
    this.wordSpawner.startSpawning();
  }

  /** Hide screen with animations */
  public async hide() {}

  /** Auto pause the app when window go out of focus */
  public blur() {
    if (!engine().navigation.currentPopup) {
      engine().navigation.presentPopup(PausePopup);
    }
  }
}
