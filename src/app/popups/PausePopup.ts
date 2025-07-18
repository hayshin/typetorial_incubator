import { animate } from "motion";
import { BlurFilter, Container, Sprite, Text, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";

/** Popup that shows up when gameplay is paused */
export class PausePopup extends Container {
  /** The dark semi-transparent background covering current screen */
  private bg: Sprite;
  /** Container for the popup UI components */
  private panel: Container;
  /** The popup title label */
  private title: Label;
  /** Button that closes the popup */
  private doneButton: Text;
  /** The panel background */
  private panelBase: RoundedBox;

  constructor() {
    super();

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({ height: 300 });
    this.panel.addChild(this.panelBase);

    this.title = new Label({
      text: "Пауза",
      style: { fill: 0x111111, fontSize: 50 },
    });
    this.title.y = -80;
    this.panel.addChild(this.title);

    // Create text button (▶️ RESUME)
    this.doneButton = new Text({
      text: "▶️",
      style: {
        fontSize: 80,
        fill: 0x111111,
        fontWeight: "bold",
        align: "center",
      },
    });
    this.doneButton.anchor.set(0.5);
    this.doneButton.y = 60;
    this.doneButton.eventMode = "static";
    this.doneButton.cursor = "pointer";
    this.doneButton.on("pointerup", () => engine().navigation.dismissPopup());
    this.panel.addChild(this.doneButton);
  }

  /** Resize the popup, fired whenever window size changes */
  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  /** Present the popup, animated */
  public async show() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [
        new BlurFilter({ strength: 5 }),
      ];
    }
    this.bg.alpha = 0;
    this.panel.pivot.y = -400;
    animate(this.bg, { alpha: 0.8 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: 0 },
      { duration: 0.3, ease: "backOut" },
    );
  }

  /** Dismiss the popup, animated */
  public async hide() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [];
    }
    animate(this.bg, { alpha: 0 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: -500 },
      { duration: 0.3, ease: "backIn" },
    );
  }
}
