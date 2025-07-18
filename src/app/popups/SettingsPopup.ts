import { List } from "@pixi/ui";
import { animate } from "motion";
import { BlurFilter, Container, Sprite, Text, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";
import { VolumeSlider } from "../ui/VolumeSlider";
import { userSettings } from "../utils/userSettings";

/** Popup for volume */
export class SettingsPopup extends Container {
  /** The dark semi-transparent background covering current screen */
  private bg: Sprite;
  /** Container for the popup UI components */
  private panel: Container;
  /** The popup title label */
  private title: Text;
  /** Button that closes the popup */
  private doneButton: Text;
  /** The panel background */
  private panelBase: RoundedBox;
  /** The build version label */
  private versionLabel: Text;
  /** Layout that organises the UI components */
  private layout: List;
  /** Slider that changes the master volume */
  private masterSlider: VolumeSlider;
  /** Slider that changes background music volume */
  private bgmSlider: VolumeSlider;
  /** Slider that changes sound effects volume */
  private sfxSlider: VolumeSlider;

  constructor() {
    super();

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({ height: 425 });
    this.panel.addChild(this.panelBase);

    this.title = new Text({
      text: "НАСТРОЙКИ",
      style: {
        fontSize: 50,
        fill: 0x111111,
        fontWeight: "bold",
        align: "center",
      },
    });
    this.title.anchor.set(0.5);
    this.title.y = -this.panelBase.boxHeight * 0.5 + 60;
    this.panel.addChild(this.title);

    // Create text button (🆗 OK)
    this.doneButton = new Text({
      text: "🆗",
      style: {
        fontSize: 80,
        fill: 0x111111,
        fontWeight: "bold",
        align: "center",
      },
    });
    this.doneButton.anchor.set(0.5);
    this.doneButton.y = this.panelBase.boxHeight * 0.5 - 78;
    this.doneButton.eventMode = "static";
    this.doneButton.cursor = "pointer";
    this.doneButton.on("pointerup", () => engine().navigation.dismissPopup());
    this.panel.addChild(this.doneButton);

    this.versionLabel = new Label({
      text: `Версия ${APP_VERSION}`,
      style: {
        fill: 0x111111,
        fontSize: 12,
      },
    });
    this.versionLabel.alpha = 0.5;
    this.versionLabel.y = this.panelBase.boxHeight * 0.5 - 15;
    this.panel.addChild(this.versionLabel);

    this.layout = new List({ type: "vertical", elementsMargin: 4 });
    this.layout.x = -140;
    this.layout.y = -80;
    this.panel.addChild(this.layout);

    this.masterSlider = new VolumeSlider("Общая громкость");
    this.masterSlider.onUpdate.connect((v) => {
      userSettings.setMasterVolume(v / 100);
    });
    this.layout.addChild(this.masterSlider);

    this.bgmSlider = new VolumeSlider("Громкость музыки");
    this.bgmSlider.onUpdate.connect((v) => {
      userSettings.setBgmVolume(v / 100);
    });
    this.layout.addChild(this.bgmSlider);

    this.sfxSlider = new VolumeSlider("Громкость звуков");
    this.sfxSlider.onUpdate.connect((v) => {
      userSettings.setSfxVolume(v / 100);
    });
    this.layout.addChild(this.sfxSlider);
  }

  /** Resize the popup, fired whenever window size changes */
  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  /** Set things up just before showing the popup */
  public prepare() {
    this.masterSlider.value = userSettings.getMasterVolume() * 100;
    this.bgmSlider.value = userSettings.getBgmVolume() * 100;
    this.sfxSlider.value = userSettings.getSfxVolume() * 100;
  }

  /** Present the popup, animated */
  public async show() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [
        new BlurFilter({ strength: 4 }),
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
      {
        duration: 0.3,
        ease: "backIn",
      },
    );
  }
}
