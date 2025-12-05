import * as PIXI from "pixi.js";
import { Player } from "./Player";

type CollisionObject = { x: number; y: number; width: number; height: number };

export class PlayerController {
  private app: PIXI.Application;
  private world: PIXI.Container;
  private player: Player;
  private collisions: CollisionObject[];
  private cameraX = 0;
  private cameraY = 0;
  private speed = 6;
  private keys: Record<string, boolean> = {};

  private worldScale = 2;
  private worldOffsetX = 0;
  private worldOffsetY = 0;
  private mapWidth = 0;
  private mapHeight = 0;

  constructor(app: PIXI.Application, world: PIXI.Container, player: Player, collisions: CollisionObject[]) {
    this.app = app;
    this.world = world;
    this.player = player;
    this.collisions = collisions;

    this.initControls();
    this.startLoop();
  }

  setWorldTransform(scale: number, offsetX: number, offsetY: number, mapWidth: number, mapHeight: number) {
    this.worldScale = scale;
    this.worldOffsetX = offsetX;
    this.worldOffsetY = offsetY;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;

    this.cameraX = offsetX;
    this.cameraY = offsetY;

    this.world.scale.set(this.worldScale);
  }

  private initControls() {
    window.addEventListener("keydown", (e) => (this.keys[e.key.toLowerCase()] = true));
    window.addEventListener("keyup", (e) => (this.keys[e.key.toLowerCase()] = false));
  }

  private startLoop() {
    this.app.ticker.add(() => this.update());
  }

  private update() {
    let dx = 0,
      dy = 0;
    if (this.keys["arrowup"] || this.keys["z"]) dy -= this.speed;
    if (this.keys["arrowdown"] || this.keys["s"]) dy += this.speed;
    if (this.keys["arrowleft"] || this.keys["q"]) dx -= this.speed;
    if (this.keys["arrowright"] || this.keys["d"]) dx += this.speed;

    const nextX = this.player.x + dx / this.worldScale;
    const nextY = this.player.y + dy / this.worldScale;

    // --- collisions
    const half = 16;
    const boxX = { x: nextX - half, y: this.player.y - half, width: 12, height: 12 };
    if (!this.isColliding(boxX)) this.player.x = nextX;

    const boxY = { x: this.player.x - half, y: nextY - half, width: 12, height: 12 };
    if (!this.isColliding(boxY)) this.player.y = nextY;

    // --- position du joueur à l’écran
    const playerScreenX = this.player.x * this.worldScale + this.world.x;
    const playerScreenY = this.player.y * this.worldScale + this.world.y;

    // --- zone morte centrée
    const zoneWidth = this.app.screen.width / 3;
    const zoneHeight = this.app.screen.height / 3;

    const zoneLeft = (this.app.screen.width - zoneWidth) / 2;
    const zoneRight = zoneLeft + zoneWidth;
    const zoneTop = (this.app.screen.height - zoneHeight) / 2;
    const zoneBottom = zoneTop + zoneHeight;

    // --- limites caméra (bord de map)
    const scaledW = this.mapWidth * this.worldScale;
    const scaledH = this.mapHeight * this.worldScale;

    let minCameraX: number, maxCameraX: number;
    if (scaledW > this.app.screen.width) {
      minCameraX = this.app.screen.width - scaledW;
      maxCameraX = 0;
    } else {
      const centerX = (this.app.screen.width - scaledW) / 2;
      minCameraX = maxCameraX = centerX;
    }

    let minCameraY: number, maxCameraY: number;
    if (scaledH > this.app.screen.height) {
      minCameraY = this.app.screen.height - scaledH;
      maxCameraY = 0;
    } else {
      const centerY = (this.app.screen.height - scaledH) / 2;
      minCameraY = maxCameraY = centerY;
    }

    // --- déplacement caméra : seulement si elle n'est pas déjà bloquée
    let targetCameraX = this.cameraX;
    let targetCameraY = this.cameraY;

    if (playerScreenX < zoneLeft && this.cameraX < maxCameraX) {
      targetCameraX += (zoneLeft - playerScreenX);
    } else if (playerScreenX > zoneRight && this.cameraX > minCameraX) {
      targetCameraX -= (playerScreenX - zoneRight);
    }

    if (playerScreenY < zoneTop && this.cameraY < maxCameraY) {
      targetCameraY += (zoneTop - playerScreenY);
    } else if (playerScreenY > zoneBottom && this.cameraY > minCameraY) {
      targetCameraY -= (playerScreenY - zoneBottom);
    }

    // --- clamp caméra
    this.cameraX = Math.min(Math.max(targetCameraX, minCameraX), maxCameraX);
    this.cameraY = Math.min(Math.max(targetCameraY, minCameraY), maxCameraY);

    // --- interpolation fluide
    const smoothness = 0.2;
    this.world.x += (this.cameraX - this.world.x) * smoothness;
    this.world.y += (this.cameraY - this.world.y) * smoothness;
  }

  private isColliding(playerBox: any): boolean {
    for (const obj of this.collisions) {
      const overlap =
        playerBox.x < obj.x + obj.width &&
        playerBox.x + playerBox.width > obj.x &&
        playerBox.y < obj.y + obj.height &&
        playerBox.y + playerBox.height > obj.y;
      if (overlap) return true;
    }
    return false;
  }
}
