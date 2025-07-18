import type { Ticker } from "pixi.js";
import {
  BlurFilter,
  Container,
  Graphics,
  Sprite,
  Text,
  Texture,
} from "pixi.js";
import { GameState } from "../../core/GameState";
import { InputManager } from "../../core/InputManager";
import { GameConstants } from "../../data/GameConstants";
import { Level3TextManager } from "../../data/Level3TextManager";
import { Boss } from "../../entities/Boss";
import { Player } from "../../entities/Player";
import type { Word } from "../../entities/Word";
import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { WordSpawner } from "../../systems/WordSpawner";
import { Label } from "../../ui/Label";
import { ProgressBar } from "../../ui/ProgressBar";
import { TabBar } from "../../ui/TabBar";
import { TypingTextDisplay } from "../../ui/TypingTextDisplay";
import { GameOverScreen } from "../gameover/GameOverScreen";
import { LevelIntroScreen } from "../levels/LevelIntroScreen";
import { Mentor } from "../../entities/Mentor";
import { VictoryScreen } from "../victory/VictoryScreen";


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
  private mentor!: Mentor; // Level 2 mentor entity

  // UI elements
  private progressBar!: ProgressBar;

  // Level 3 components
  private typingTextDisplay!: TypingTextDisplay;
  private boss!: Boss;
  private currentBossText: string = "";
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
  private completedMessages: number = 0;
  private totalMessagesInLevel: number = 0;

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

    // Initialize boss (hidden by default)
    this.boss = new Boss();
    this.boss.visible = false;
    this.boss.onDefeated = this.handleBossDefeated.bind(this);
    this.mainContainer.addChild(this.boss);

    console.log(`Player initialized at: (${this.player.x}, ${this.player.y})`);
    console.log(`MainContainer will be positioned at center during resize`);
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

    // Initialize mentor for Level 2 (after word spawner)
    this.initializeMentor();
    
    // Connect mentor spawn position for Level 2 (after mentor is created)
    if (GameState.getCurrentLevel() === 2 && this.mentor) {
      this.wordSpawner.getMentorSpawnPosition = () => {
        return this.mentor.getWordSpawnPosition();
      };
      this.wordSpawner.onMentorSpeaking = (speaking: boolean) => {
        this.setMentorSpeaking(speaking);
      };
    }
  }

  /** Ensure player is properly positioned on the left side */
  private ensurePlayerPosition(): void {
    // Make sure player is visible and on the left side
    const leftMargin = 50; // Distance from left edge
    this.player.x = -GameConstants.GAME_WIDTH / 2 + leftMargin;
    this.player.y = 400; // Center vertically relative to screen
  }

  /** Initialize mentor for Level 2 */
  private initializeMentor(): void {
    // Only show mentor in Level 2
    if (GameState.getCurrentLevel() === 2) {
      console.log("MainScreen - Initializing mentor for Level 2");
      this.mentor = new Mentor();
      this.mainContainer.addChild(this.mentor);
      console.log("MainScreen - Mentor added to screen at:", this.mentor.x, this.mentor.y);
    } else {
      console.log("MainScreen - Not Level 2, skipping mentor initialization. Current level:", GameState.getCurrentLevel());
    }
  }

  /** Initialize UI elements */
  private initUI(): void {
    // Create tab bar
    this.tabBar = new TabBar();
    this.tabBar.y = 20; // Position at top of screen
    this.addChild(this.tabBar);

    // Progress bar
    this.progressBar = new ProgressBar();
    this.addChild(this.progressBar);

    // Level 3 typing text display
    this.typingTextDisplay = new TypingTextDisplay();
    this.typingTextDisplay.visible = false; // Hidden by default
    this.mainContainer.addChild(this.typingTextDisplay);
    // Create input display at bottom
    this.createInputDisplay();
  }

  /** Handle character typed */
  private handleCharacterTyped(char: string): void {
    const currentLevel = GameState.getCurrentLevel();

    if (currentLevel === 3) {
      // Level 3: Type into the text display
      this.handleLevel3CharacterTyped(char);
    } else {
      // Levels 1-2: Original word matching logic
      this.handleLevel12CharacterTyped(char);
    }
  }

  /** Handle character typed for levels 1-2 */
  private handleLevel12CharacterTyped(char: string): void {
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

  /** Handle character typed for level 3 */
  private handleLevel3CharacterTyped(char: string): void {
    if (char === " ") {
      // Space pressed - complete current word and send it
      this.handleLevel3SpacePressed();
    } else {
      // Type character into the text display
      const success = this.typingTextDisplay.typeCharacter(char);
      // Note: wrongCharHighlight state is now managed inside TypingTextDisplay
      // We don't need to track it separately here
      if (success) {
        // Check if current word is completed
        if (this.typingTextDisplay.isCurrentWordCompleted()) {
          // Word completed, ready to send on space press
          console.log("Level 3 - word completed, waiting for space");
        }
      } else {
        console.log("Level 3 - wrong character:", char);
      }
    }
  }

  /** Handle space pressed in level 3 */
  private handleLevel3SpacePressed(): void {
    const completedWord = this.typingTextDisplay.completeCurrentWord();
    if (completedWord) {
      // Send the word as a player message
      const playerMessage = this.wordSpawner.spawnPlayerMessage(completedWord);
      console.log("Level 3 - sent word:", completedWord);

      // Word will damage boss when it reaches the right edge
      // Damage is handled in word collision detection

      // Check if entire text is completed
      if (this.typingTextDisplay.isCompleted()) {
        this.handleLevel3TextCompleted();
      }
    }
  }

  /** Handle level 3 text completion */
  private handleLevel3TextCompleted(): void {
    console.log("Level 3 - boss text completed!");
    // Boss should be defeated by now, victory handled in handleBossDefeated
  }

  /** Handle boss defeated */
  private async handleBossDefeated(): Promise<void> {
    console.log("Boss defeated - showing victory screen!");

    // Stop all game systems
    this.wordSpawner.stopSpawning();
    this.inputManager.setEnabled(false);

    // Set final score
    GameState.setFinalScore(this.score);

    // Show victory screen
    await engine().navigation.showScreen(VictoryScreen);
  }



  /** Handle backspace */
  private handleBackspace(): void {
    const currentLevel = GameState.getCurrentLevel();

    if (currentLevel === 3) {
      // Level 3: Backspace in text display
      this.typingTextDisplay.backspace();
    } else {
      // Levels 1-2: Original logic
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

    // Track completed messages for progress
    this.completedMessages++;

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

  /** Update progress bar */
  private updateProgressBar(): void {
    // Update progress bar based on current level
    const currentLevel = GameState.getCurrentLevel();

    if (currentLevel === 3) {
      // Level 3: Use typing progress with word count
      const typingProgress = this.typingTextDisplay.getProgress();
      const typedText = this.typingTextDisplay.getTypedText();
      const fullText = this.typingTextDisplay.getFullText();

      // Count words by splitting on spaces
      const typedWords = typedText.trim()
        ? typedText.trim().split(/\s+/).length
        : 0;
      const totalWords = fullText.trim().split(/\s+/).length;

      this.progressBar.updateProgressWithTypingProgress(
        typingProgress,
        typedWords,
        totalWords,
      );
    } else {
      // Levels 1-2: Use completed messages (not remaining)
      const remainingMessages =
        this.totalMessagesInLevel - this.completedMessages;
      this.progressBar.updateProgress(
        currentLevel,
        remainingMessages,
        this.totalMessagesInLevel,
      );
    }
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

    // Update boss if visible
    if (this.boss.visible) {
      this.boss.update(time.deltaMS / 1000);
      // Check collisions between player messages and boss
      this.checkPlayerMessageCollisions();
    }

    // Update UI displays
    this.updateLevelDisplay();
    this.updateProgressBar();
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

    // Reset progress tracking
    this.completedMessages = 0;
    this.totalMessagesInLevel = 0;

    // Reset level 3 components
    this.typingTextDisplay.reset();
    this.boss.reset();
    this.boss.visible = false;
    this.currentBossText = "";

    // Reset progress bar
    this.progressBar.reset();

    this.updateScoreDisplay();
    this.updateLivesDisplay();
    this.updateLevelDisplay();
    this.updateProgressBar();
    this.inputManager.setEnabled(true);

    // Don't reset GameState during level transitions
    if (!GameState.isTransitioning()) {
      GameState.reset();
    }
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



    // Resize level 3 components
    this.typingTextDisplay.resize(width, height);

    // Resize progress bar
    this.progressBar.resize(width, height);
    // Position input display at bottom
    this.inputDisplay.x = centerX - 200; // Center the input box
    this.inputDisplay.y = centerY + height / 2 - 80; // 80px from bottom

    // Resize mentor for Level 2
    if (this.mentor) {
      this.mentor.resize();
    }
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

    // Show progress bar with animation
    this.progressBar.show();

    // Setup level-specific components
    this.setupLevelComponents();

    // Reset word spawner for current level and start spawning
    this.wordSpawner.resetForLevel();
    this.wordSpawner.startSpawning();
  }

  /** Setup components specific to current level */
  private setupLevelComponents(): void {
    const currentLevel = GameState.getCurrentLevel();

    if (currentLevel === 3) {
      // Show typing text display for level 3
      this.typingTextDisplay.visible = true;

      // Show and setup boss
      this.boss.visible = true;

      // Get random boss text and set it
      const bossText = Level3TextManager.getRandomText();
      this.currentBossText = bossText.text;
      this.typingTextDisplay.setText(this.currentBossText);

      // Set boss health based on text length
      const bossHealth = Level3TextManager.calculateBossHealth(
        this.currentBossText,
      );
      this.boss.setHealth(bossHealth);

      console.log("Level 3 - boss text set:", this.currentBossText);
      console.log("Level 3 - boss health set:", bossHealth);

      // Show boss with animation
      this.boss.show();


    } else {
      // Reset progress tracking for levels 1-2
      this.completedMessages = 0;
      this.totalMessagesInLevel = this.wordSpawner.getTotalMessageCount();

      // Hide typing text display and boss for levels 1-2
      this.typingTextDisplay.visible = false;
      this.boss.visible = false;
    }
  }

  /** Check collisions between player messages and boss */
  private checkPlayerMessageCollisions(): void {
    const activeWords = this.wordSpawner.getActiveWords();

    for (const word of activeWords) {
      // Check if this is a player message (moving right) that reached the boss
      if (
        word.isPlayerWord() &&
        word.x >= this.boss.x - 50 &&
        !word.isCompleted
      ) {
        // Word hit the boss - deal damage
        this.boss.takeDamage(word.targetText.length);

        // Mark word as completed to prevent multiple hits
        word.isCompleted = true;
      }
    }
  }

  /** Hide screen with animations */
  public async hide() {
    // Hide progress bar
    this.progressBar.hide();
  }

  /** Auto pause the app when window go out of focus */
  public blur() {
    if (!engine().navigation.currentPopup) {
      engine().navigation.presentPopup(PausePopup);
    }
  }

  private setMentorSpeaking(speaking: boolean) {
    if (this.mentor) {
      if (speaking) {
        this.mentor.startSpeaking();
      } else {
        this.mentor.stopSpeaking();
      }
    }
  }
}
