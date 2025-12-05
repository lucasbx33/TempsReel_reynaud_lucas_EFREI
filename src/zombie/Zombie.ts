import * as PIXI from "pixi.js";
import { Player } from "../player/Player";
import { Pathfinder } from "./core/Pathfinder";
import { GameManager } from "../core/GameManager";

export class Zombie extends PIXI.Container {
  private sprite: PIXI.Graphics;
  private speed = 2;
  private target: Player;
  private pathfinder: Pathfinder;
  private path: { x: number; y: number }[] = [];
  private currentTargetIndex = 0;
  private tileSize = 32;
  private repathTimer = 0;

  private attackRange = 20;
  private attackDamage = 10;
  private attackCooldown = 500;
  private attackTimer = 0;

  private maxHealth = 50;
  private health = 50;
  private healthBarBg: PIXI.Graphics;
  private healthBarFill: PIXI.Graphics;

  private isDead = false;

  constructor(target: Player, pathfinder: Pathfinder) {
    super();
    this.target = target;
    this.pathfinder = pathfinder;

    this.sprite = new PIXI.Graphics().rect(-10, -10, 20, 20).fill(0x27ae60);
    this.addChild(this.sprite);

    this.healthBarBg = new PIXI.Graphics()
      .rect(-12, -20, 24, 4)
      .fill(0x000000);
    this.addChild(this.healthBarBg);

    this.healthBarFill = new PIXI.Graphics()
      .rect(-12, -20, 24, 4)
      .fill(0xe74c3c);
    this.addChild(this.healthBarFill);
  }

  getHitbox() {
    return {
      x: this.x - 10,
      y: this.y - 10,
      width: 20,
      height: 20,
    };
  }

  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;

    const ratio = this.health / this.maxHealth;
    const barWidth = 24 * ratio;

    this.healthBarFill.clear();
    this.healthBarFill.rect(-12, -20, barWidth, 4).fill(0xe74c3c);

    if (this.health <= 0) this.die();
  }

  die() {
    if (this.isDead) return;

    this.isDead = true;
    this.target.addCoins(5);

    this.visible = false;

    requestAnimationFrame(() => {
      this.parent?.removeChild(this);
      this.destroy({ children: true });
    });
  }

  get dead() {
    return this.isDead;
  }

  private applySeparation(zombies: Zombie[], delta: number) {
    const desiredSeparation = 26;
    let steerX = 0;
    let steerY = 0;
    let count = 0;

    for (const other of zombies) {
        if (other === this || other.dead) continue;

        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist > 0 && dist < desiredSeparation) {
            const force = 1 / dist;

            steerX += (dx / dist) * force;
            steerY += (dy / dist) * force;
            count++;
        }
    }

    if (count > 0) {
        steerX /= count;
        steerY /= count;

        const len = Math.sqrt(steerX * steerX + steerY * steerY);
        if (len > 0) {
            steerX = (steerX / len) * 1.2;
            steerY = (steerY / len) * 1.2;
        }

        this.x += steerX * delta;
        this.y += steerY * delta;
    }
  }

  update(delta: number, zombies: Zombie[]) {
    if (GameManager.paused) return;

    this.applySeparation(zombies, delta);

    this.repathTimer += delta;

    const pathUpdateThreshold = 0.5; // en secondes

  if (this.repathTimer > pathUpdateThreshold) {
    // Recalculer le chemin vers le joueur
    const newPath = this.pathfinder.findPath(
      this.x,
      this.y,
      this.target.x,
      this.target.y,
      this.tileSize
    );

      if (newPath.length > 0) {
        if (this.path.length > 0) {
          const lastTarget = this.path[this.currentTargetIndex] ?? this.path[0];
          let closestIndex = 0;
          let closestDist = Infinity;

          newPath.forEach((p, i) => {
            const dx = p.x - lastTarget.x;
            const dy = p.y - lastTarget.y;
            const d = dx * dx + dy * dy;
            if (d < closestDist) {
              closestDist = d;
              closestIndex = i;
            }
          });

          this.currentTargetIndex = closestIndex;
        } else {
          this.currentTargetIndex = 0;
        }

        this.path = newPath;
      }

      this.repathTimer = 0;
    }

    // 🔥 Suivre le chemin
    if (this.path.length > 0 && this.currentTargetIndex < this.path.length) {
      const targetNode = this.path[this.currentTargetIndex];
      const dx = targetNode.x - this.x;
      const dy = targetNode.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        const vx = (dx / dist) * this.speed * delta;
        const vy = (dy / dist) * this.speed * delta;
        this.x += vx;
        this.y += vy;
        this.rotation = Math.atan2(dy, dx);
      } else {
        this.currentTargetIndex++;
      }
    }

    // 🔥 Attaque du joueur
    this.attackTimer += delta * 16;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.attackRange && this.attackTimer >= this.attackCooldown) {
      this.target.takeDamage(this.attackDamage);
      this.attackTimer = 0;
    }
  }
}
