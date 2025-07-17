import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Sprite, Texture } from "pixi.js";

import { GameState } from "../../core/GameState";
import { InputManager } from "../../core/InputManager";
import { engine } from "../../getEngine";
import { Label } from "../../ui/Label";
import { RoundedBox } from "../../ui/RoundedBox";

/** Screen shown before each level starts */
export class LevelIntroScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  /** The dark semi-transparent background */
  private bg: Sprite;
  /** Container for the level intro UI */
  private panel: Container;
  /** The panel background */
  private panelBase: RoundedBox;
  /** Level title */
  private titleLabel: Label;
  /** Level description */
  private descriptionLabel: Label;
  /** Subtitle with instructions */
  private subtitleLabel: Label;
  /** Input manager for space key detection */
  private inputManager: InputManager;

  /** Level information */
  private levelInfo: {
    title: string;
    description: string;
  };

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
      width: 600,
      height: 400,
      color: 0x1a1a1a,
    });
    this.panel.addChild(this.panelBase);

    // Create title label
    this.titleLabel = new Label({
      text: "LEVEL 1",
      style: {
        fontSize: 48,
        fill: 0x4488ff,
        fontWeight: "bold",
      },
    });
    this.titleLabel.anchor.set(0.5);
    this.titleLabel.y = -120;
    this.panel.addChild(this.titleLabel);

    // Create description label
    this.descriptionLabel = new Label({
      text: "Type the incoming messages before they reach you!",
      style: {
        fontSize: 20,
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: 500,
        align: "center",
      },
    });
    this.descriptionLabel.anchor.set(0.5);
    this.descriptionLabel.y = -20;
    this.panel.addChild(this.descriptionLabel);

    // Create subtitle label
    this.subtitleLabel = new Label({
      text: "Press SPACE to begin",
      style: {
        fontSize: 18,
        fill: 0xcccccc,
      },
    });
    this.subtitleLabel.anchor.set(0.5);
    this.subtitleLabel.y = 80;
    this.panel.addChild(this.subtitleLabel);

    // Setup input manager for space key
    this.inputManager = new InputManager();
    this.inputManager.setEnabled(false); // Will be enabled when screen is shown

    // Set default level info
    this.levelInfo = this.getLevelInfo(1);

    // Add blinking animation to subtitle
    this.addBlinkingEffect();
  }

  /**
   * Get level information based on level number
   */
  private getLevelInfo(level: 1 | 2 | 3): {
    title: string;
    description: string;
  } {
    switch (level) {
      case 1:
        return {
          title: "LEVEL 1: MESSAGES",
          description:
            "Type the incoming messages before they reach you! Messages will come from the right side of the screen.",
        };
      case 2:
        return {
          title: "LEVEL 2: THE SPEAKER",
          description:
            "A person appears on the right side! Messages now come from their mouth. Type them quickly!",
        };
      case 3:
        return {
          title: "LEVEL 3: BOSS BATTLE",
          description:
            "Now YOU send messages! Type the text below to attack the boss. Defeat them before they defeat you!",
        };
      default:
        return {
          title: "LEVEL 1: MESSAGES",
          description: "Type the incoming messages before they reach you!",
        };
    }
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
   * Setup space key listener
   */
  private setupSpaceListener(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        this.startLevel();
        window.removeEventListener("keydown", handleKeyDown);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
  }

  /**
   * Start the level
   */
  private async startLevel(): Promise<void> {
    this.inputManager.setEnabled(false);

    // Complete the level transition in GameState
    GameState.completeLevelTransition();

    // Navigate to the appropriate level screen
    const currentLevel = GameState.getCurrentLevel();

    switch (currentLevel) {
      case 1:
      case 2:
      case 3: {
        // For now, all levels use MainScreen
        // In the future, we can create separate level screens
        const { MainScreen } = await import("../main/MainScreen");
        await engine().navigation.showScreen(MainScreen);
        break;
      }
    }
  }

  /**
   * Update level info from GameState
   */
  private updateLevelInfo(): void {
    const level =
      GameState.getTransitioningToLevel() || GameState.getCurrentLevel();
    this.levelInfo = this.getLevelInfo(level as 1 | 2 | 3);

    this.titleLabel.text = this.levelInfo.title;
    this.descriptionLabel.text = this.levelInfo.description;
  }

  /** Prepare the screen just before showing */
  public prepare(): void {
    // Update level info from game state
    this.updateLevelInfo();
  }

  /** Update the screen */
  public update(): void {
    // Level intro screen doesn't need updates
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
