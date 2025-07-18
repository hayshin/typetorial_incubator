import { Container, Sprite, Texture } from "pixi.js";
import { GameConstants } from "../data/GameConstants";

export class Mentor extends Container {
  private sprite: Sprite;
  private currentState: "default" | "speaking" | "active" = "default";
  private isSpeaking: boolean = false;

  constructor() {
    super();

    console.log("Mentor - Creating mentor entity");
    this.sprite = new Sprite(Texture.from("main/mentors/assel/0.png"));
    this.sprite.anchor.set(0.5, 0.5);
    
    // Resize the sprite - adjust these values as needed
    this.sprite.scale.set(0.3, 0.3); // 50% of original size
    
    this.addChild(this.sprite);

    this.x = GameConstants.GAME_WIDTH / 2 - 50;
    this.y = 300;

    console.log("Mentor - Positioned at:", this.x, this.y);
    this.setState("default");
  }

  public setState(state: "default" | "speaking" | "active"): void {
    this.currentState = state;
    
    switch (state) {
      case "default":
        this.sprite.texture = Texture.from("main/mentors/assel/0.png");
        break;
      case "speaking":
        this.sprite.texture = Texture.from("main/mentors/assel/1.png");
        break;
      case "active":
        this.sprite.texture = Texture.from("main/mentors/assel/2.png");
        break;
    }
  }

  public startSpeaking(): void {
    this.isSpeaking = true;
    this.setState("speaking");
    this.animateSpeaking();
  }

  public stopSpeaking(): void {
    this.isSpeaking = false;
    this.setState("default");
  }

  private animateSpeaking(): void {
    if (!this.isSpeaking) return;

    if (this.currentState === "speaking") {
      setTimeout(() => {
        if (this.isSpeaking) {
          this.setState("active");
          this.animateSpeaking();
        }
      }, 500);
    } else {
      setTimeout(() => {
        if (this.isSpeaking) {
          this.setState("speaking");
          this.animateSpeaking();
        }
      }, 500);
    }
  }

  public getWordSpawnPosition(): { x: number; y: number } {
    return {
      x: this.x - 50,
      y: this.y - 30,
    };
  }

  public resize(): void {
    this.x = GameConstants.GAME_WIDTH / 2 - 100;
    this.y = 0;
  }

  /**
   * Set the size of the mentor sprite
   * @param scale - Scale factor (0.5 = 50%, 1.0 = 100%, 1.5 = 150%)
   */
  public setSize(scale: number): void {
    this.sprite.scale.set(scale, scale);
  }

  /**
   * Set specific dimensions for the mentor sprite
   * @param width - Width in pixels
   * @param height - Height in pixels
   */
  public setDimensions(width: number, height: number): void {
    this.sprite.width = width;
    this.sprite.height = height;
  }
}
