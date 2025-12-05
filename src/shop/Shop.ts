import * as PIXI from "pixi.js";
import { Player } from "../player/Player";
import { WaveManager } from "../wave/WaveManager";
import { Weapons } from "../player/core/attack/weapon";

export class Shop {
  private app: PIXI.Application;
  private player: Player;
  private waveManager: WaveManager;
  private onClose: () => void;
  private overlay: PIXI.Container;

  constructor(app: PIXI.Application, player: Player, waveManager: WaveManager, onClose: () => void) {
    this.app = app;
    this.player = player;
    this.waveManager = waveManager;
    this.onClose = onClose;

    this.overlay = new PIXI.Container();
    this.overlay.visible = false;
    app.stage.addChild(this.overlay);

    this.buildUI();
  }

  private createButton(text: string, y: number, color = 0xffff00) {
    const btn = new PIXI.Text(text, {
      fill: color,
      fontSize: 28,
      fontFamily: "Arial",
      stroke: "#000"
    });

    btn.x = this.app.screen.width / 2 - btn.width / 2;
    btn.y = y;
    btn.eventMode = "static";
    btn.cursor = "pointer";

    return btn;
  }

  private buildUI() {
    const bg = new PIXI.Graphics()
      .rect(0, 0, this.app.screen.width, this.app.screen.height)
      .fill({ color: 0x000000, alpha: 0.7 });
    this.overlay.addChild(bg);

    const title = new PIXI.Text("SHOP", {
      fill: 0xffffff,
      fontSize: 48,
      stroke: "#000"
    });
    title.x = this.app.screen.width / 2 - title.width / 2;
    title.y = 80;
    this.overlay.addChild(title);

    // 🔫 Munitions
    const ammoBtn = this.createButton("Acheter 30 munitions (5 coins)", 200);
    this.overlay.addChild(ammoBtn);
    ammoBtn.on("pointerdown", () => {
      if (this.player.coins >= 5) {
        this.player.coins -= 5;
        this.player.weapon.reserveAmmo += 30;
      } else {
        ammoBtn.text = "Pas assez !";
        setTimeout(() => ammoBtn.text = "Acheter 30 munitions (5 coins)", 1200);
      }
    });

    // ❤️ Soin
    const healBtn = this.createButton("Bandage (+30 HP) - 10 coins", 260);
    this.overlay.addChild(healBtn);
    healBtn.on("pointerdown", () => {
      if (this.player.coins >= 10) {
        this.player.coins -= 10;
        this.player.takeDamage(-30);
      } else {
        healBtn.text = "Pas assez !";
        setTimeout(() => healBtn.text = "Bandage (+30 HP) - 10 coins", 1200);
      }
    });

    if (!this.player.ownedWeapons.has("AK-47")) {
      const akBtn = this.createButton("Acheter AK-47 (20 coins)", 320, 0xffaa00);
      this.overlay.addChild(akBtn);

      akBtn.on("pointerdown", () => {
        if (this.player.coins >= 20) {
          this.player.coins -= 20;

          this.player.weapon.switchWeapon(Weapons.AK47);

          this.player.ownedWeapons.add("AK-47");

          akBtn.visible = false;

        } else {
          akBtn.text = "Pas assez !";
          setTimeout(() => akBtn.text = "Acheter AK-47 (20 coins)", 1200);
        }
      });
    }

    const continueBtn = this.createButton("Continuer", 400, 0xffffff);
    this.overlay.addChild(continueBtn);
    continueBtn.on("pointerdown", () => this.close());
  }

  open() {
    this.overlay.visible = true;
  }

  close() {
    this.overlay.visible = false;
    this.onClose();
  }
}
