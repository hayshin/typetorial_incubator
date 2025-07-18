import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Sprite, Texture } from "pixi.js";

import { GameState } from "../core/GameState";

import { engine } from "../getEngine";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";

/** Start screen with difficulty selection */
export class StartScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  /** The dark semi-transparent background */
  private bg: Sprite;
  /** Container for the start screen UI */
  private panel: Container;
  /** The panel background */
  private panelBase: RoundedBox;
  /** Game title */
  private titleLabel: Label;
  /** Subtitle with description */
  private subtitleLabel: Label;
  /** Difficulty selection label */
  private difficultyLabel: Label;
  /** Easy difficulty button */
  private easyButton!: Button;
  /** Medium difficulty button */
  private mediumButton!: Button;
  /** Hard difficulty button */
  private hardButton!: Button;
  /** Start game button */
  private startButton: Button;
  /** Currently selected difficulty */
  private selectedDifficulty: "easy" | "medium" | "hard" = "easy";

  constructor() {
    super();

    // Create background
    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x000000;
    this.bg.alpha = 0.8;
    this.addChild(this.bg);

    // Create panel container
    this.panel = new Container();
    this.addChild(this.panel);

    // Create panel background
    this.panelBase = new RoundedBox({
      width: 700,
      height: 620,
      color: 0x1a1a1a,
    });
    this.panel.addChild(this.panelBase);

    // Create title label
    this.titleLabel = new Label({
      text: "НФАКТОРИАЛ ИНКУБАТОР",
      style: {
        fontSize: 56,
        fill: 0x4488ff,
        fontWeight: "bold",
      },
    });
    this.titleLabel.anchor.set(0.5);
    this.titleLabel.y = -220;
    this.panel.addChild(this.titleLabel);

    // Create subtitle label
    this.subtitleLabel = new Label({
      text: "Дойдете ли вы до Демо Дэя, хватит ли вам скорости печати и креативности?",
      style: {
        fontSize: 22,
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: 600,
        align: "center",
      },
    });
    this.subtitleLabel.anchor.set(0.5);
    this.subtitleLabel.y = -150;
    this.panel.addChild(this.subtitleLabel);

    // Create difficulty selection label
    this.difficultyLabel = new Label({
      text: "Выберите сложность:",
      style: {
        fontSize: 28,
        fill: 0xffffff,
        fontWeight: "bold",
      },
    });
    this.difficultyLabel.anchor.set(0.5);
    this.difficultyLabel.y = -70;
    this.panel.addChild(this.difficultyLabel);

    // Create difficulty buttons
    this.createDifficultyButtons();

    // Create start button
    this.startButton = new Button({
      text: "НАЧАТЬ ИГРУ",
      width: 300,
      height: 80,
      fontSize: 24,
    });
    this.startButton.y = 200;
    this.startButton.scale.set(1.0);
    this.panel.addChild(this.startButton);

    // Override start button behavior to prevent y movement
    this.startButton.removeAllListeners();
    this.startButton.eventMode = "static";
    this.startButton.cursor = "pointer";

    let isHovered = false;
    let isPressed = false;

    this.startButton.on("pointerover", () => {
      if (!isPressed) {
        isHovered = true;
        this.startButton.scale.set(1.05);
      }
      engine().audio.sfx.play("main/sounds/sfx-hover.wav");
    });

    this.startButton.on("pointerout", () => {
      if (!isPressed) {
        isHovered = false;
        this.startButton.scale.set(1.0);
      }
    });

    this.startButton.on("pointerdown", () => {
      isPressed = true;
      this.startButton.scale.set(0.97);
      engine().audio.sfx.play("main/sounds/sfx-press.wav");
    });

    this.startButton.on("pointerup", () => {
      isPressed = false;
      this.startButton.scale.set(isHovered ? 1.05 : 1.0);
      this.startGame();
    });

    this.startButton.on("pointerupoutside", () => {
      isPressed = false;
      this.startButton.scale.set(1.0);
    });

    // Setup button callbacks
    this.setupButtonCallbacks();

    // Initialize with saved difficulty
    this.selectedDifficulty = GameState.getDifficulty();
    this.updateButtonStates();
  }

  /**
   * Create difficulty selection buttons
   */
  private createDifficultyButtons(): void {
    // Easy button
    this.easyButton = new Button({
      text: "ЛЕГКО",
      width: 150,
      height: 60,
      fontSize: 20,
    });
    this.easyButton.x = -180;
    this.easyButton.y = 20;
    this.panel.addChild(this.easyButton);

    // Medium button
    this.mediumButton = new Button({
      text: "СРЕДНЕ",
      width: 150,
      height: 60,
      fontSize: 20,
    });
    this.mediumButton.x = 0;
    this.mediumButton.y = 20;
    this.panel.addChild(this.mediumButton);

    // Hard button
    this.hardButton = new Button({
      text: "СЛОЖНО",
      width: 150,
      height: 60,
      fontSize: 20,
    });
    this.hardButton.x = 180;
    this.hardButton.y = 20;
    this.panel.addChild(this.hardButton);

    // Add difficulty descriptions
    this.createDifficultyDescriptions();
  }

  /**
   * Create difficulty description labels
   */
  private createDifficultyDescriptions(): void {
    const descriptions = {
      easy: "Скорость: 80px/s\nИнтервал: 4s\nИдеально для новичков",
      medium: "Скорость: 120px/s\nИнтервал: 3s\nСбалансированный вызов",
      hard: "Скорость: 160px/s\nИнтервал: 2s\nДля мастеров печати",
    };

    // Easy description
    const easyDesc = new Label({
      text: descriptions.easy,
      style: {
        fontSize: 12,
        fill: 0xcccccc,
        align: "center",
        wordWrap: true,
        wordWrapWidth: 140,
      },
    });
    easyDesc.anchor.set(0.5);
    easyDesc.x = -180;
    easyDesc.y = 105;
    this.panel.addChild(easyDesc);

    // Medium description
    const mediumDesc = new Label({
      text: descriptions.medium,
      style: {
        fontSize: 12,
        fill: 0xcccccc,
        align: "center",
        wordWrap: true,
        wordWrapWidth: 140,
      },
    });
    mediumDesc.anchor.set(0.5);
    mediumDesc.x = 0;
    mediumDesc.y = 105;
    this.panel.addChild(mediumDesc);

    // Hard description
    const hardDesc = new Label({
      text: descriptions.hard,
      style: {
        fontSize: 12,
        fill: 0xcccccc,
        align: "center",
        wordWrap: true,
        wordWrapWidth: 140,
      },
    });
    hardDesc.anchor.set(0.5);
    hardDesc.x = 180;
    hardDesc.y = 105;
    this.panel.addChild(hardDesc);

    // Add stats legend
    const statsLegend = new Label({
      text: "Скорость = скорость движения слов | Интервал = время между словами",
      style: {
        fontSize: 10,
        fill: 0x888888,
        align: "center",
        wordWrap: true,
        wordWrapWidth: 600,
      },
    });
    statsLegend.anchor.set(0.5);
    statsLegend.y = 155;
    this.panel.addChild(statsLegend);
  }

  /**
   * Setup button event callbacks
   */
  private setupButtonCallbacks(): void {
    // Easy button
    this.easyButton.onPress.connect(() => {
      this.selectDifficulty("easy");
    });

    // Medium button
    this.mediumButton.onPress.connect(() => {
      this.selectDifficulty("medium");
    });

    // Hard button
    this.hardButton.onPress.connect(() => {
      this.selectDifficulty("hard");
    });

    // Start button event is now handled in the creation section above
  }

  /**
   * Select a difficulty level
   */
  private selectDifficulty(difficulty: "easy" | "medium" | "hard"): void {
    this.selectedDifficulty = difficulty;
    GameState.setDifficulty(difficulty);
    this.updateButtonStates();
  }

  /**
   * Update button visual states based on selection
   */
  private updateButtonStates(): void {
    // Reset all buttons to default state
    this.resetButtonState(this.easyButton);
    this.resetButtonState(this.mediumButton);
    this.resetButtonState(this.hardButton);

    // Highlight selected button
    let selectedButton: Button;
    switch (this.selectedDifficulty) {
      case "easy":
        selectedButton = this.easyButton;
        break;
      case "medium":
        selectedButton = this.mediumButton;
        break;
      case "hard":
        selectedButton = this.hardButton;
        break;
    }

    this.highlightButton(selectedButton);
  }

  /**
   * Reset a button to default visual state
   */
  private resetButtonState(button: Button): void {
    button.scale.set(0.9);
    button.alpha = 0.7;
    button.tint = 0xffffff; // Default white tint
  }

  /**
   * Highlight a button as selected
   */
  private highlightButton(button: Button): void {
    button.scale.set(1.0);
    button.alpha = 1.0;
    button.tint = 0x4488ff; // Blue tint for selected button
  }

  /**
   * Start the game with selected difficulty
   */
  private async startGame(): Promise<void> {
    // Set the difficulty in GameState
    GameState.setDifficulty(this.selectedDifficulty);

    // Reset game state for new game
    GameState.reset();
    GameState.setDifficulty(this.selectedDifficulty); // Reset clears difficulty, so set it again

    // Navigate to level intro screen
    const { LevelIntroScreen } = await import("./levels/LevelIntroScreen");
    await engine().navigation.showScreen(LevelIntroScreen);
  }

  /** Prepare the screen just before showing */
  public prepare(): void {
    // Load saved difficulty preference
    this.selectedDifficulty = GameState.getDifficulty();
    this.updateButtonStates();
  }

  /** Update the screen */
  public update(): void {
    // Start screen doesn't need updates
  }

  /** Resize the screen, fired whenever window size changes */
  public resize(width: number, height: number): void {
    // Resize background to cover full screen
    this.bg.width = width;
    this.bg.height = height;

    // Center the panel
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    // Start with invisible elements
    this.bg.alpha = 0;
    this.panel.scale.set(0.5);
    this.panel.alpha = 0;

    // Animate background fade in
    animate(this.bg, { alpha: 0.8 } as ObjectTarget<Sprite>, {
      duration: 0.3,
      ease: "easeOut",
    });

    // Animate panel scale and fade in
    const panelAnimation = animate(
      this.panel,
      { alpha: 1 } as ObjectTarget<Container>,
      { duration: 0.4, ease: "easeOut", delay: 0.1 },
    );

    await animate(
      this.panel.scale,
      { x: 1, y: 1 },
      { duration: 0.5, ease: "backOut", delay: 0.1 },
    );

    await panelAnimation;
  }

  /** Hide screen with animations */
  public async hide(): Promise<void> {
    // Animate out
    const bgAnimation = animate(this.bg, { alpha: 0 } as ObjectTarget<Sprite>, {
      duration: 0.2,
      ease: "easeIn",
    });

    const panelAnimation = animate(
      this.panel,
      { alpha: 0 } as ObjectTarget<Container>,
      { duration: 0.2, ease: "easeIn" },
    );

    await Promise.all([bgAnimation, panelAnimation]);
  }

  /** Cleanup when screen is destroyed */
  public destroy(): void {
    super.destroy();
  }
}
