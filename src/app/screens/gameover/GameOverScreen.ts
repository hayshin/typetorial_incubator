import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import type { Ticker } from "pixi.js";
import { Container, Sprite, Texture } from "pixi.js";

import { GameState } from "../../core/GameState";
import { InputManager } from "../../core/InputManager";
import { engine } from "../../getEngine";
import { Label } from "../../ui/Label";
import { RoundedBox } from "../../ui/RoundedBox";

/** Screen shown when game is over */
export class GameOverScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  /** The dark semi-transparent background */
  private bg: Sprite;
  /** Container for the game over UI */
  private panel: Container;
  /** The panel background */
  private panelBase: RoundedBox;
  /** Game over title */
  private titleLabel: Label;
  /** Subtitle with instructions */
  private subtitleLabel: Label;
  /** Score display */
  private scoreLabel: Label;
  /** Input manager for space key detection */
  private inputManager: InputManager;

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
      width: 500,
      height: 350,
      color: 0x1a1a1a,
      borderColor: 0x444444,
      borderWidth: 2,
    });
    this.panel.addChild(this.panelBase);

    // Create title label
    this.titleLabel = new Label({
      text: "GAME OVER",
      style: {
        fontSize: 48,
        fill: 0xff4444,
        fontWeight: "bold",
      },
    });
    this.titleLabel.anchor.set(0.5);
    this.titleLabel.y = -80;
    this.panel.addChild(this.titleLabel);

    // Create score label
    this.scoreLabel = new Label({
      text: "Final Score: 0",
      style: {
        fontSize: 24,
        fill: 0xffffff,
      },
    });
    this.scoreLabel.anchor.set(0.5);
    this.scoreLabel.y = -20;
    this.panel.addChild(this.scoreLabel);

    // Create subtitle label
    this.subtitleLabel = new Label({
      text: "Press SPACE to try again",
      style: {
        fontSize: 18,
        fill: 0xcccccc,
      },
    });
    this.subtitleLabel.anchor.set(0.5);
    this.subtitleLabel.y = 40;
    this.panel.addChild(this.subtitleLabel);

    // Setup input manager for space key
    this.inputManager = new InputManager();
    this.inputManager.onCharacterTyped = this.handleKeyPressed.bind(this);
    this.inputManager.setEnabled(false); // Will be enabled when screen is shown

    // Add blinking animation to subtitle
    this.addBlinkingEffect();
  }

  /**
   * Add blinking effect to the subtitle
   */
  private addBlinkingEffect(): void {
    const blink = () => {
      animate(this.subtitleLabel, { alpha: 0.3 } as ObjectTarget<Label>, {
        duration: 0.8,
        ease: "easeInOut",
      }).then(() => {
        animate(this.subtitleLabel, { alpha: 1 } as ObjectTarget<Label>, {
          duration: 0.8,
          ease: "easeInOut",
        }).then(blink);
      });
    };
    blink();
  }

  /**
   * Handle key pressed (looking for space)
   */
  private handleKeyPressed(): void {
    // Override to handle space key specifically
    // We'll also listen for space in a different way
  }

  /**
   * Setup space key listener
   */
  private setupSpaceListener(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        this.restartGame();
        window.removeEventListener("keydown", handleKeyDown);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
  }

  /**
   * Restart the game
   */
  private async restartGame(): Promise<void> {
    this.inputManager.setEnabled(false);
    // Navigate back to main screen - it will reset itself
    const { MainScreen } = await import("../main/MainScreen");
    await engine().navigation.showScreen(MainScreen);
  }

  /**
   * Update score display from GameState
   */
  private updateScoreFromGameState(): void {
    if (GameState.hasJustEnded()) {
      const score = GameState.getFinalScore();
      this.scoreLabel.text = `Final Score: ${score}`;
      GameState.consume();
    }
  }

  /** Prepare the screen just before showing */
  public prepare(): void {
    // Update score from game state
    this.updateScoreFromGameState();
  }

  /** Update the screen */
  public update(): void {
    // Game over screen doesn't need updates
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
    // Enable input listening
    this.inputManager.setEnabled(true);
    this.setupSpaceListener();

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
    // Disable input
    this.inputManager.setEnabled(false);

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
    this.inputManager.destroy();
    super.destroy();
  }
}
