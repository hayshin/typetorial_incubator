import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { Ticker } from "pixi.js";
import { Container } from "pixi.js";

import { InputManager } from "../../core/InputManager";
import type { Word } from "../../entities/Word";
import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { WordSpawner } from "../../systems/WordSpawner";
import { Label } from "../../ui/Label";

/** The screen that holds the app */
export class MainScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  public mainContainer: Container;
  private pauseButton: FancyButton;
  private settingsButton: FancyButton;
  private paused = false;

  // Game components
  private inputManager: InputManager;
  private wordSpawner: WordSpawner;
  private gameContainer: Container;

  // UI elements
  private currentInputDisplay: Label;
  private scoreDisplay: Label;
  private livesDisplay: Label;

  // Game state
  private score: number = 0;
  private lives: number = 3;
  private currentInput: string = "";

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

    // Initialize input manager
    this.inputManager = new InputManager();
    this.inputManager.onCharacterTyped = this.handleCharacterTyped.bind(this);
    this.inputManager.onBackspace = this.handleBackspace.bind(this);

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
    this.currentInput += char;
    this.updateInputDisplay();

    // Try to find matching word or continue typing active word
    this.processInput();
  }

  /** Handle backspace */
  private handleBackspace(): void {
    if (this.currentInput.length > 0) {
      this.currentInput = this.currentInput.slice(0, -1);
      this.updateInputDisplay();
    }
  }

  /** Process current input */
  private processInput(): void {
    // If no active word, try to find matching word
    let activeWord = this.wordSpawner.getActiveWord();

    if (!activeWord) {
      activeWord = this.wordSpawner.findMatchingWord(this.currentInput);
      if (activeWord) {
        this.wordSpawner.setActiveWord(activeWord);
      }
    }

    // If we have active word, try typing on it
    if (activeWord) {
      const lastChar = this.currentInput[this.currentInput.length - 1];
      const success = activeWord.typeCharacter(lastChar);

      if (!success) {
        // Wrong character, clear input
        this.currentInput = "";
        this.updateInputDisplay();
        this.wordSpawner.setActiveWord(null);
      }
    }
  }

  /** Update input display */
  private updateInputDisplay(): void {
    this.currentInputDisplay.text = `Input: ${this.currentInput}`;
  }

  /** Handle word reaching edge */
  private handleWordReachedEdge(word: Word): void {
    this.lives--;
    this.updateLivesDisplay();

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  /** Handle word completed */
  private handleWordCompleted(word: Word): void {
    this.score += word.targetText.length * 10;
    this.updateScoreDisplay();

    // Clear input and deactivate word
    this.currentInput = "";
    this.updateInputDisplay();
    this.wordSpawner.setActiveWord(null);
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
  private gameOver(): void {
    this.wordSpawner.stopSpawning();
    this.inputManager.setEnabled(false);

    // TODO: Show game over screen
    console.log("Game Over! Final Score:", this.score);
  }

  /** Prepare the screen just before showing */
  public prepare() {}

  /** Update the screen */
  public update(time: Ticker) {
    if (this.paused) return;

    // Update word spawner
    this.wordSpawner.update(time.deltaMS / 1000);
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
    this.currentInput = "";
    this.wordSpawner.clearAllWords();
    this.updateScoreDisplay();
    this.updateLivesDisplay();
    this.updateInputDisplay();
  }

  /** Resize the screen, fired whenever window size changes */
  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.mainContainer.x = centerX;
    this.mainContainer.y = centerY;
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
