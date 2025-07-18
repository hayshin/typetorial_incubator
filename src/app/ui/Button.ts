import { Container, Graphics, Text } from "pixi.js";

import { engine } from "../getEngine";

const defaultButtonOptions = {
  text: "",
  width: 301,
  height: 112,
  fontSize: 28,
};

type ButtonOptions = typeof defaultButtonOptions;

/**
 * The big rectangle button, with a label, idle and pressed states
 */
export class Button extends Container {
  private background: Graphics;
  private buttonLabel: Text;
  private isPressed = false;
  private isHovered = false;

  constructor(options: Partial<ButtonOptions> = {}) {
    super();
    const opts = { ...defaultButtonOptions, ...options };

    // Create button background
    this.background = new Graphics()
      .roundRect(0, 0, opts.width, opts.height, 25)
      .fill({ color: 0xec1561 })
      .roundRect(4, 4, opts.width - 8, opts.height - 8, 21)
      .fill({ color: 0xffffff });

    this.background.x = -opts.width * 0.5;
    this.background.y = -opts.height * 0.5;
    this.addChild(this.background);

    // Create label
    this.buttonLabel = new Text(opts.text, {
      fontFamily: "San Francisco",
      fontSize: opts.fontSize,
      fill: 0x4a4a4a,
      align: "center",
    });
    this.buttonLabel.anchor.set(0.5);
    this.buttonLabel.y = -13;
    this.addChild(this.buttonLabel);

    // Make interactive
    this.eventMode = "static";
    this.cursor = "pointer";

    // Event listeners
    this.on("pointerdown", this.handleDown.bind(this));
    this.on("pointerup", this.handleUp.bind(this));
    this.on("pointerupoutside", this.handleUp.bind(this));
    this.on("pointerover", this.handleHover.bind(this));
    this.on("pointerout", this.handleOut.bind(this));
  }

  private handleDown() {
    this.isPressed = true;
    this.scale.set(0.97);
    this.y = 10;
    engine().audio.sfx.play("main/sounds/sfx-press.wav");
  }

  private handleUp() {
    this.isPressed = false;
    this.scale.set(this.isHovered ? 1.03 : 0.9);
    this.y = this.isHovered ? 0 : 0;
  }

  private handleHover() {
    this.isHovered = true;
    if (!this.isPressed) {
      this.scale.set(1.03);
      this.y = 0;
    }
    engine().audio.sfx.play("main/sounds/sfx-hover.wav");
  }

  private handleOut() {
    this.isHovered = false;
    if (!this.isPressed) {
      this.scale.set(0.9);
      this.y = 0;
    }
  }

  /** Connect a callback to the button press event */
  public get onPress() {
    return {
      connect: (callback: () => void) => {
        this.on("pointerup", callback);
      },
    };
  }
}
