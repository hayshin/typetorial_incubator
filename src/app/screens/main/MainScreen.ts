import type { Ticker } from "pixi.js";
import { Container, Sprite, Texture, BlurFilter, Graphics, Text } from "pixi.js";
import { GameState } from "../../core/GameState";
import { InputManager } from "../../core/InputManager";
import { Player } from "../../entities/Player";
import type { Word } from "../../entities/Word";
import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { WordSpawner } from "../../systems/WordSpawner";
import { TabBar } from "../../ui/TabBar";
import { GameOverScreen } from "../gameover/GameOverScreen";
import { LevelIntroScreen } from "../levels/LevelIntroScreen";
import { GameConstants } from "../../data/GameConstants";

/** The screen that holds the app */
export class MainScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  public mainContainer: Container;
  private backgroundSprite: Sprite;
  private paused = false;

  // Game components
  private inputManager!: InputManager;
  private wordSpawner!: WordSpawner;
  private gameContainer!: Container;
  private player!: Player;

  // UI elements
  private tabBar!: TabBar;
  private inputDisplay!: Container;
  private inputBackground!: Graphics;
  private inputText!: Text;
  private textCursor!: Graphics;

  // Game state
  private score: number = 0;
  private lives: number = 3;
  private currentInput: string = "";
  private wrongCharHighlight: boolean = false;

  constructor() {
    super();

    // Create background sprite
    this.backgroundSprite = new Sprite(Texture.from("background_main.png"));
    this.backgroundSprite.anchor.set(0.5);

    // Add blur filter to background
    const blurFilter = new BlurFilter(9); // Blur strength: 2 (adjust as needed)
    this.backgroundSprite.filters = [blurFilter];

    this.addChild(this.backgroundSprite);

    this.mainContainer = new Container();
    this.addChild(this.mainContainer);

    // Initialize game components
    this.initGame();
    this.initUI();
  }

  /** Initialize game components */
  private initGame(): void {
    // Create game container for words
    this.gameContainer = new Container();
    this.mainContainer.addChild(this.gameContainer);

    // Initialize player
    this.player = new Player();
    this.mainContainer.addChild(this.player);

    // Ensure player is properly positioned
    this.ensurePlayerPosition();

    // Initialize input manager
    this.inputManager = new InputManager();
    this.inputManager.onCharacterTyped = this.handleCharacterTyped.bind(this);
    this.inputManager.onBackspace = this.handleBackspace.bind(this);
    this.inputManager.onEscape = this.handleEscape.bind(this);

    // Initialize word spawner
    this.wordSpawner = new WordSpawner(this.gameContainer);
    this.wordSpawner.onWordReachedEdge = this.handleWordReachedEdge.bind(this);
    this.wordSpawner.onWordCompleted = this.handleWordCompleted.bind(this);
    this.wordSpawner.onLevelAdvance = this.handleLevelAdvance.bind(this);
  }

  /** Ensure player is properly positioned on the left side */
  private ensurePlayerPosition(): void {
    // Make sure player is visible and on the left side
    const leftMargin = 10; // Distance from left edge
    this.player.x = -GameConstants.GAME_WIDTH / 2 + leftMargin;
    this.player.y = 400; // Center vertically
  }

  /** Initialize UI elements */
  private initUI(): void {
    // Create tab bar
    this.tabBar = new TabBar();
    this.tabBar.y = 20; // Position at top of screen
    this.addChild(this.tabBar);

    // Create input display at bottom
    this.createInputDisplay();
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
      this.player.shootBullet();
    }
  }

  /** Create input display at bottom */
  private createInputDisplay(): void {
    this.inputDisplay = new Container();
    this.addChild(this.inputDisplay);

    // Create white background
    this.inputBackground = new Graphics()
      .roundRect(0, 0, 400, 50, 8)
      .fill({ color: 0xffffff });
    this.inputDisplay.addChild(this.inputBackground);

    // Create input text
    this.inputText = new Text({
      text: "Type here...",
      style: {
        fontFamily: GameConstants.FONT_FAMILY,
        fontSize: 18,
        fill: 0x000000,
      },
    });
    this.inputText.x = 15;
    this.inputText.y = 15;
    this.inputDisplay.addChild(this.inputText);

    // Create blinking cursor
    this.textCursor = new Graphics()
      .rect(0, 0, 2, 20)
      .fill({ color: 0x000000 });
    this.textCursor.x = 15;
    this.textCursor.y = 15;
    this.inputDisplay.addChild(this.textCursor);

    // Start cursor blinking animation
    this.startCursorBlink();
  }

  /** Start cursor blinking animation */
  private startCursorBlink(): void {
    let visible = true;
    setInterval(() => {
      this.textCursor.visible = visible;
      visible = !visible;
    }, 500);
  }

  /** Update input display */
  private updateInputDisplay(): void {
    let displayText = this.currentInput || "Type here...";

    // Add visual feedback for wrong character
    if (this.wrongCharHighlight) {
      const activeWord = this.wordSpawner.getActiveWord();
      if (activeWord) {
        const expectedChar = activeWord.getNextCharacter();
        displayText += ` (Expected: ${expectedChar})`;
      }
    }

    this.inputText.text = displayText;
    
    // Update cursor position
    this.textCursor.x = 15 + this.inputText.width;
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

  /** Handle level advance */
  private async handleLevelAdvance(): Promise<void> {
    // Stop spawning and disable input
    this.wordSpawner.stopSpawning();
    this.inputManager.setEnabled(false);

    // Clear current input and reset state for new level
    this.clearInput();

    // Show level intro screen
    await engine().navigation.showScreen(LevelIntroScreen);
  }

  /** Update score display */
  private updateScoreDisplay(): void {
    this.tabBar.updateScore(this.score);
  }

  /** Update lives display */
  private updateLivesDisplay(): void {
    this.tabBar.updateLives(this.lives);
  }

  /** Update level display */
  private updateLevelDisplay(): void {
    this.tabBar.updateLevel(GameState.getCurrentLevel());
  }

  /** Update progress display */
  private updateProgressDisplay(): void {
    const progress = GameState.getLevelProgress();
    this.tabBar.updateProgress(progress);
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

    // Update UI displays
    this.updateLevelDisplay();
    this.updateProgressDisplay();
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
    this.wordSpawner.resetForLevel();
    this.player.clearBullets();
    this.updateScoreDisplay();
    this.updateLivesDisplay();
    this.updateLevelDisplay();
    this.updateProgressDisplay();
    this.inputManager.setEnabled(true);
    GameState.reset();
  }

  /** Resize the screen, fired whenever window size changes */
  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    // Resize and position background
    this.backgroundSprite.x = centerX;
    this.backgroundSprite.y = centerY;
    this.backgroundSprite.width = width;
    this.backgroundSprite.height = height;

    this.mainContainer.x = centerX;
    this.mainContainer.y = centerY;

    // Ensure player is properly positioned after resize
    this.ensurePlayerPosition();
    this.tabBar.resize(width - 60); // Leave margin for pause/settings buttons
    this.tabBar.x = 30; // Align with pause button

    // Position input display at bottom
    this.inputDisplay.x = centerX - 200; // Center the input box
    this.inputDisplay.y = centerY + height / 2 - 80; // 80px from bottom
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

    // Reset word spawner for current level and start spawning
    this.wordSpawner.resetForLevel();
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
