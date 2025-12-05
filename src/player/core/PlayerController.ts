import * as PIXI from "pixi.js";
import { Player } from "../Player";
import { CollisionObject } from "./types";
import { InputController } from "./InputController";
import { CollisionDetector } from "./CollisionDetector";
import { CameraController } from "./CameraController";
import { GameManager } from "../../core/GameManager";

export class PlayerController {
  private input: InputController;
  private collisionDetector: CollisionDetector;
  private camera: CameraController;

  private speed = 6;

  constructor(
    private app: PIXI.Application,
    private world: PIXI.Container,
    private player: Player,
    collisions: CollisionObject[],
    worldScale: number,
    worldOffsetX: number,
    worldOffsetY: number,
    mapWidth: number,
    mapHeight: number
  ) {
    this.input = new InputController();
    this.collisionDetector = new CollisionDetector(collisions);
    this.camera = new CameraController(app, world, worldScale, worldOffsetX, worldOffsetY, mapWidth, mapHeight);
    this.app.ticker.add(() => this.update());
  }

  private update() {
    if (GameManager.paused) return;

    const { dx, dy } = this.input.getDirection(this.speed);

    const nextX = this.player.x + dx / 2;
    const nextY = this.player.y + dy / 2;

    const half = 16;
    const boxX = { x: nextX - half, y: this.player.y - half, width: 12, height: 12 };
    if (!this.collisionDetector.isColliding(boxX)) this.player.x = nextX;

    const boxY = { x: this.player.x - half, y: nextY - half, width: 12, height: 12 };
    if (!this.collisionDetector.isColliding(boxY)) this.player.y = nextY;

    // --- Tir du joueur
    if (this.input.isShooting()) {
      const rect = this.app.view.getBoundingClientRect();
      const mouse = this.input.getMousePosition();

      // Position de la souris dans le canvas (coordonnées écran / stage)
      const screenX = mouse.x - rect.left;
      const screenY = mouse.y - rect.top;

      // Conversion écran → monde (Méthode Pixi MAGIQUE)
      const screenPoint = new PIXI.Point(screenX, screenY);
      const worldPoint = this.world.toLocal(screenPoint);

      const projectile = this.player.weapon.tryShoot(
        this.player.x,
        this.player.y,
        worldPoint.x,
        worldPoint.y
      );

      if (projectile) {
          this.world.addChild(projectile);
          this.player.weapon.projectiles.push(projectile);
      }
    }

    if (this.input.shouldReload()) {
      this.player.weapon.reload();
    }

    if (dx !== 0 || dy !== 0) {
      this.player.sprite.rotation = Math.atan2(dy, dx);
    }

    this.player.faceMovement(dx, dy);
    this.camera.updateCamera(this.player);
  }
  
}
