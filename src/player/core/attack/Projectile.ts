import * as PIXI from "pixi.js";

export class Projectile extends PIXI.Container {
  speed: number;
  damage: number;
  dir: { x: number; y: number };
  collisions: any[];
  public dead = false;

  constructor(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    damage: number,
    speed: number,
    collisions: any[]
  ) {
    super();

    this.x = startX;
    this.y = startY;

    this.damage = damage;
    this.speed = speed;
    this.collisions = collisions;

    const dx = targetX - startX;
    const dy = targetY - startY;
    const len = Math.sqrt(dx * dx + dy * dy);

    this.dir = { x: dx / len, y: dy / len };

    const sprite = new PIXI.Graphics().circle(0, 0, 4).fill(0xf1c40f);
    this.addChild(sprite);
  }

  update(delta: number) {
    if (this.dead) return;

    this.x += this.dir.x * this.speed * delta;
    this.y += this.dir.y * this.speed * delta;

    // collision avec décor
    for (const c of this.collisions) {
      if (
        this.x > c.x &&
        this.x < c.x + c.width &&
        this.y > c.y &&
        this.y < c.y + c.height
      ) {
        this.dead = true;
        return;
      }
    }
  }
}
