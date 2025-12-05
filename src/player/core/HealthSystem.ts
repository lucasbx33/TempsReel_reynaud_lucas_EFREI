import * as PIXI from "pixi.js";

export class HealthSystem extends PIXI.Container {
  maxHealth: number;
  health: number;

  private barWidth = 30;
  private barHeight = 4;

  private bg: PIXI.Graphics;
  private bar: PIXI.Graphics;

  constructor(maxHealth = 100) {
    super();

    this.maxHealth = maxHealth;
    this.health = maxHealth;

    // --- Fond de la barre (noir)
    this.bg = new PIXI.Graphics()
      .rect(0, 0, this.barWidth, this.barHeight)
      .fill(0x000000);
    this.addChild(this.bg);

    // --- Barre de vie (vert)
    this.bar = new PIXI.Graphics()
      .rect(0, 0, this.barWidth, this.barHeight)
      .fill(0x2ecc71);
    this.addChild(this.bar);
  }

  takeDamage(amount: number) {
    this.health = Math.max(this.health - amount, 0);
    this.updateBar();
  }

  heal(amount: number) {
    this.health = Math.min(this.health + amount, this.maxHealth);
    this.updateBar();
  }

  private updateBar() {
    const ratio = this.health / this.maxHealth;

    this.bar.clear();
    this.bar.beginFill(0x2ecc71);
    this.bar.drawRect(0, 0, this.barWidth * ratio, this.barHeight);
    this.bar.endFill();
  }

  isDead(): boolean {
    return this.health <= 0;
  }
}
