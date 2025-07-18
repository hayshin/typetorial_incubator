import { Container, Graphics } from "pixi.js";

const defaultRoundedBoxOptions = {
  color: 0xffffff,
  width: 350,
  height: 600,
};

export type RoundedBoxOptions = typeof defaultRoundedBoxOptions;

/**
 * Generic plain white box drawn with Graphics that can be resized freely.
 */
export class RoundedBox extends Container {
  /** The rectangular area, drawn as a plain rectangle */
  private image: Graphics;

  constructor(options: Partial<RoundedBoxOptions> = {}) {
    super();
    const opts = { ...defaultRoundedBoxOptions, ...options };

    this.image = new Graphics()
      .rect(0, 0, opts.width, opts.height)
      .fill({ color: opts.color });
    this.image.x = -this.image.width * 0.5;
    this.image.y = -this.image.height * 0.5;
    this.addChild(this.image);
  }

  /** Get the base width */
  public get boxWidth() {
    return this.image.width;
  }

  /** Get the base height */
  public get boxHeight() {
    return this.image.height;
  }
}
