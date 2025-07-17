import { Container, Graphics } from "pixi.js";
import { Label } from "./Label";
import { engine } from "../getEngine";
import { PausePopup } from "../../app/popups/PausePopup";
import { SettingsPopup } from "../../app/popups/SettingsPopup";
import { GameConstants } from "../data/GameConstants";

/**
 * Tab bar component for game UI elements
 */
export class TabBar extends Container {
  private background: Graphics;
  private elements: Container;

  // UI elements
  public stopButton!: Label;
  public settingsButton!: Label;
  public scoreDisplay!: Label;
  public livesDisplay!: Label;
  public levelDisplay!: Label;
  public progressDisplay!: Label;

  constructor() {
    super();

    // Create background
    this.background = new Graphics();
    this.background.fill({ color: 0x333333, alpha: 0.9 }); // Dark gray with high opacity for visibility
    this.background.roundRect(0, 0, 800, 60, 10);
    this.addChild(this.background);

    // Create container for UI elements
    this.elements = new Container();
    this.addChild(this.elements);

    // Create UI elements
    this.createUIElements();
  }

  private createUIElements(): void {
    const elementSpacing = 20;
    let currentX = 20;

    // Stop button
    this.stopButton = new Label({
      text: "⏸️",
      style: {
        fontFamily: GameConstants.FONT_FAMILY,
        fontSize: 40,
        fill: 0xff4444,
      },
    });
    this.stopButton.x = currentX;
    this.stopButton.y = 24; // Adjusted for larger size
    this.stopButton.interactive = true; // Make it clickable
    this.stopButton.on("pointerdown", () => {
      engine().navigation.presentPopup(PausePopup);
    });
    this.elements.addChild(this.stopButton);
    currentX += this.stopButton.width + elementSpacing;



    // Score display
    this.scoreDisplay = new Label({
      text: "Score: 0",
      style: {
        fontFamily: GameConstants.FONT_FAMILY,
        fontSize: 16,
        fill: 0xffffff,
      },
    });
    this.scoreDisplay.x = currentX;
    this.scoreDisplay.y = 20;
    this.elements.addChild(this.scoreDisplay);
    currentX += this.scoreDisplay.width + elementSpacing;

    // Lives display
    this.livesDisplay = new Label({
      text: "Lives: 3",
      style: {
        fontFamily: GameConstants.FONT_FAMILY,
        fontSize: 16,
        fill: 0xff0000,
      },
    });
    this.livesDisplay.x = currentX;
    this.livesDisplay.y = 20;
    this.elements.addChild(this.livesDisplay);
    currentX += this.livesDisplay.width + elementSpacing;

    // Level display
    this.levelDisplay = new Label({
      text: "Level: 1",
      style: {
        fontFamily: GameConstants.FONT_FAMILY,
        fontSize: 16,
        fill: 0x4488ff,
      },
    });
    this.levelDisplay.x = currentX;
    this.levelDisplay.y = 20;
    this.elements.addChild(this.levelDisplay);
    currentX += this.levelDisplay.width + elementSpacing;

    // Progress display
    this.progressDisplay = new Label({
      text: "Progress: 0%",
      style: {
        fontFamily: GameConstants.FONT_FAMILY,
        fontSize: 16,
        fill: 0xcccccc,
      },
    });
    this.progressDisplay.x = currentX;
    this.progressDisplay.y = 20;
    this.elements.addChild(this.progressDisplay);

    // Settings button (positioned on the right side)
    this.settingsButton = new Label({
      text: "⚙️",
      style: {
        fontFamily: GameConstants.FONT_FAMILY,
        fontSize: 40,
        fill: 0xffffff,
      },
    });
    // Position will be set in resize method
    this.settingsButton.y = 24; // Adjusted for larger size
    this.settingsButton.interactive = true; // Make it clickable
    this.settingsButton.on("pointerdown", () => {
      engine().navigation.presentPopup(SettingsPopup);
    });
    this.elements.addChild(this.settingsButton);
  }



  /**
   * Update score display
   */
  public updateScore(score: number): void {
    this.scoreDisplay.text = `Score: ${score}`;
  }

  /**
   * Update lives display
   */
  public updateLives(lives: number): void {
    this.livesDisplay.text = `Lives: ${lives}`;
  }

  /**
   * Update level display
   */
  public updateLevel(level: number): void {
    this.levelDisplay.text = `Level: ${level}`;
  }

  /**
   * Update progress display
   */
  public updateProgress(progress: number): void {
    this.progressDisplay.text = `Progress: ${Math.round(progress)}%`;
  }

  /**
   * Resize the tab bar
   */
  public resize(width: number): void {
    this.background.clear();
    this.background.fill({ color: 0x333333, alpha: 0.9 }); // Dark gray with high opacity for visibility
    this.background.roundRect(0, 0, width, 60, 10);

    // Position settings button on the right with margin
    const rightMargin = 20;
    this.settingsButton.x = width - this.settingsButton.width - rightMargin;
  }
}
