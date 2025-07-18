import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Sprite, Texture } from "pixi.js";

import { GameState } from "../../core/GameState";
import { InputManager } from "../../core/InputManager";
import { engine } from "../../getEngine";
import { Label } from "../../ui/Label";
import { RoundedBox } from "../../ui/RoundedBox";
import { LevelIntroScreen } from "../levels/LevelIntroScreen";

/** Screen shown when player successfully completes the game */
export class VictoryScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  /** The dark semi-transparent background */
  private bg: Sprite;
  /** Container for the victory UI */
  private panel: Container;
  /** The panel background */
  private panelBase: RoundedBox;
  /** Victory title */
  private titleLabel: Label;
  /** Victory message */
  private messageLabel: Label;
  /** Final score label */
  private scoreLabel: Label;
  /** Restart instruction */
  private restartLabel: Label;
  /** Input manager for space key detection */
  private inputManager: InputManager;

  constructor() {
    super();

    // Create background
    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x000000;
    this.bg.alpha = 0.9;
    this.addChild(this.bg);

    // Create panel container
    this.panel = new Container();
    this.addChild(this.panel);

    // Create panel background
    this.panelBase = new RoundedBox({
      width: 700,
      height: 500,
      color: 0x1a1a1a,
    });
    this.panel.addChild(this.panelBase);

    // Create title label
    this.titleLabel = new Label({
      text: "ПОБЕДА!",
      style: {
        fontSize: 64,
        fill: 0x00ff00,
        fontWeight: "bold",
      },
    });
    this.titleLabel.anchor.set(0.5);
    this.titleLabel.y = -150;
    this.panel.addChild(this.titleLabel);

    // Create message label
    this.messageLabel = new Label({
      text: "Поздравляем! Вы успешно завершили инкубатор\nи победили финального босса!",
      style: {
        fontSize: 24,
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: 600,
        align: "center",
      },
    });
    this.messageLabel.anchor.set(0.5);
    this.messageLabel.y = -50;
    this.panel.addChild(this.messageLabel);

    // Create score label
    this.scoreLabel = new Label({
      text: "Финальный счет: 0",
      style: {
        fontSize: 28,
        fill: 0xffff00,
        fontWeight: "bold",
      },
    });
    this.scoreLabel.anchor.set(0.5);
    this.scoreLabel.y = 50;
    this.panel.addChild(this.scoreLabel);

    // Create restart label
    this.restartLabel = new Label({
      text: "Нажмите SPACE, чтобы начать заново",
      style: {
        fontSize: 20,
        fill: 0xcccccc,
      },
    });
    this.restartLabel.anchor.set(0.5);
    this.restartLabel.y = 150;
    this.panel.addChild(this.restartLabel);

    // Setup input manager for space key
    this.inputManager = new InputManager();
    this.inputManager.setEnabled(false); // Will be enabled when screen is shown

    // Add blinking animation to restart label
    this.addBlinkingEffect();
  }

  /**
   * Add blinking effect to the restart label
   */
  private addBlinkingEffect(): void {
    const blink = () => {
      animate(this.restartLabel, { alpha: 0.3 } as ObjectTarget<Label>, {
        duration: 0.8,
        ease: "easeInOut",
      }).then(() => {
        animate(this.restartLabel, { alpha: 1 } as ObjectTarget<Label>, {
          duration: 0.8,
          ease: "easeInOut",
        }).then(blink);
      });
    };
    blink();
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

    // Reset game state to start from level 1
    GameState.reset();

    // Show level intro screen for level 1
    await engine().navigation.showScreen(LevelIntroScreen);
  }

  /** Prepare the screen just before showing */
  public prepare(): void {
    // Update score from game state
    const finalScore = GameState.getFinalScore();
    this.scoreLabel.text = `Финальный счет: ${finalScore}`;
  }

  /** Update the screen */
  public update(): void {
    // Victory screen doesn't need updates
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
    // Play victory music
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.3 });

    // Enable input listening
    this.inputManager.setEnabled(true);
    this.setupSpaceListener();

    // Start with invisible elements
    this.bg.alpha = 0;
    this.panel.scale.set(0.5);
    this.panel.alpha = 0;

    // Animate background fade in
    animate(this.bg, { alpha: 0.9 } as ObjectTarget<Sprite>, {
      duration: 0.5,
      ease: "easeOut",
    });

    // Animate panel scale and fade in
    const panelAnimation = animate(
      this.panel,
      { alpha: 1 } as ObjectTarget<Container>,
      { duration: 0.6, ease: "easeOut", delay: 0.2 },
    );

    await animate(
      this.panel.scale,
      { x: 1, y: 1 },
      { duration: 0.8, ease: "backOut", delay: 0.2 },
    );

    await panelAnimation;

    // Animate title with bouncing effect
    this.titleLabel.scale.set(0.5);
    await animate(
      this.titleLabel.scale,
      { x: 1.2, y: 1.2 },
      { duration: 0.3, ease: "backOut", delay: 0.5 },
    );
    await animate(
      this.titleLabel.scale,
      { x: 1, y: 1 },
      { duration: 0.2, ease: "easeOut" },
    );
  }

  /** Hide screen with animations */
  public async hide(): Promise<void> {
    // Disable input
    this.inputManager.setEnabled(false);

    // Animate out
    const bgAnimation = animate(this.bg, { alpha: 0 } as ObjectTarget<Sprite>, {
      duration: 0.3,
      ease: "easeIn",
    });

    const panelAnimation = animate(
      this.panel,
      { alpha: 0 } as ObjectTarget<Container>,
      { duration: 0.3, ease: "easeIn" },
    );

    await Promise.all([bgAnimation, panelAnimation]);
  }

  /** Cleanup when screen is destroyed */
  public destroy(): void {
    this.inputManager.destroy();
    super.destroy();
  }
}
