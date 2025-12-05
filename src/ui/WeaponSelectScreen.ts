import * as PIXI from "pixi.js";
import { WeaponStats } from "../player/core/attack/weapon";
import { Weapons } from "../player/core/attack/weapon";

export class WeaponSelectScreen {
  private container: PIXI.Container;
  private app: PIXI.Application;
  private onSelect: (weapon: WeaponStats) => void;

  constructor(app: PIXI.Application, onSelect: (w: WeaponStats) => void) {
    this.app = app;
    this.onSelect = onSelect;

    this.container = new PIXI.Container();
    this.container.zIndex = 9999;
    this.container.visible = true;

    this.buildUI();
    this.app.stage.addChild(this.container);
  }

  private buildUI() {
    const bg = new PIXI.Graphics()
      .rect(0, 0, this.app.screen.width, this.app.screen.height)
      .fill({ color: 0x000000, alpha: 0.8 });
    this.container.addChild(bg);

    const title = new PIXI.Text("Choisis ton arme", {
      fill: 0xffffff,
      fontSize: 48,
      fontFamily: "Arial",
    });
    title.x = this.app.screen.width / 2 - title.width / 2;
    title.y = 80;
    this.container.addChild(title);

    const glockBtn = this.createButton("🔫 Glock 18", 220);
    this.container.addChild(glockBtn);
    glockBtn.on("pointerdown", () => this.select(Weapons.Glock));

    const shotgunBtn = this.createButton("💥 Shotgun", 300);
    this.container.addChild(shotgunBtn);
    shotgunBtn.on("pointerdown", () => this.select(Weapons.Shotgun));
  }

  private createButton(label: string, y: number): PIXI.Text {
    const btn = new PIXI.Text(label, {
      fill: 0xffd700,
      fontFamily: "Arial",
      fontSize: 32,
      stroke: "#000"
    });

    btn.x = this.app.screen.width / 2 - btn.width / 2;
    btn.y = y;
    btn.eventMode = "static";
    btn.cursor = "pointer";

    return btn;
  }

  private select(weapon: WeaponStats) {
    this.container.visible = false;
    this.onSelect(weapon);
  }
}
