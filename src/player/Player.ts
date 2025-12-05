import * as PIXI from "pixi.js";
import { HealthSystem } from "./core/HealthSystem";
import { WeaponSystem } from "./core/attack/WeaponSystem";

export class Player extends PIXI.Container {
  public onDeath: (() => void) | null = null;
  public isDead = false;

  public sprite!: PIXI.AnimatedSprite;

  public healthSystem!: HealthSystem;
  public weapon!: WeaponSystem;

  public maxHealth = 100;
  public health = 100;
  public coins = 0;

  public ownedWeapons: Set<string> = new Set();

  frameSize = 128;

  animations: Record<string, PIXI.Texture[]> = {};
  idleAnimations: Record<string, PIXI.Texture[]> = {};

  constructor(private collisions: any[]) {
    super();
  }

  async init() {
    await this.loadAnimations();

    this.sprite = new PIXI.AnimatedSprite(this.idleAnimations["down"]);
    this.sprite.anchor.set(0.5);
    this.sprite.animationSpeed = 0.2;
    this.sprite.scale.set(0.7);
    this.sprite.play();
    this.addChild(this.sprite);

    this.healthSystem = new HealthSystem(100);
    this.healthSystem.x = -40;
    this.healthSystem.y = -70;
    this.addChild(this.healthSystem);

    this.weapon = new WeaponSystem(this, null, this.collisions);
  }

async loadAnimations() {
  const runSheet = await PIXI.Assets.load("/Run.png");
  const idleSheet = await PIXI.Assets.load("/Idle.png");

  const rows = 8;
  const cols = 14;

  // 👉 On calcule la vraie taille d’une frame à partir de l’image
  const frameWidth = runSheet.width / cols;
  const frameHeight = runSheet.height / rows;

  const directionsMap: Record<number, string> = {
    0: "right",
    1: "down-right",
    2: "down",
    3: "down-left",
    4: "left",
    5: "up-left",
    6: "up",
    7: "up-right",
  };

  // RUN
  for (let row = 0; row < rows; row++) {
    const dir = directionsMap[row] ?? `row${row}`;
    this.animations[dir] = [];

    for (let col = 0; col < cols; col++) {
      const frame = new PIXI.Rectangle(
        col * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight
      );

      const tex = new PIXI.Texture({
        source: runSheet.source,
        frame,
      });

      this.animations[dir].push(tex);
    }
  }

  // IDLE
  for (let row = 0; row < rows; row++) {
    const dir = directionsMap[row] ?? `row${row}`;
    this.idleAnimations[dir] = [];

    for (let col = 0; col < cols; col++) {
      const frame = new PIXI.Rectangle(
        col * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight
      );

      const tex = new PIXI.Texture({
        source: idleSheet.source,
        frame,
      });

      this.idleAnimations[dir].push(tex);
    }
  }

  // Juste pour vérifier dans la console :
  console.log("frames right :", this.animations["right"]?.length);
}

  faceMovement(dx: number, dy: number) {
    if (!this.sprite) return;

    if (dx === 0 && dy === 0) {
      this.sprite.textures = this.idleAnimations["down"];
      this.sprite.rotation = 0;
      this.sprite.scale.set(0.7, 0.7);
      this.sprite.play();
      return;
    }

    let dir = "down";

    if (dx !== 0 && dy !== 0) {
      if (dx > 0 && dy > 0) dir = "down-right";
      else if (dx < 0 && dy > 0) dir = "down-left";
      else if (dx > 0 && dy < 0) dir = "up-right";
      else if (dx < 0 && dy < 0) dir = "up-left";
    } else if (dx !== 0) {
      dir = dx > 0 ? "right" : "left";
    } else if (dy !== 0) {
      dir = dy > 0 ? "down" : "up";
    }

    this.sprite.textures = this.animations[dir];

    this.sprite.rotation = 0;
    this.sprite.scale.set(0.7, 0.7);

    this.sprite.play();
  }

  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health > this.maxHealth) this.health = this.maxHealth;
    if (this.health < 0) this.health = 0;

    this.healthSystem.takeDamage(amount);

    if (!this.isDead && this.health <= 0) {
      this.isDead = true;
      this.visible = false;
      this.onDeath?.();
    }
  }

  addCoins(amount: number) {
    this.coins += amount;
  }
}
