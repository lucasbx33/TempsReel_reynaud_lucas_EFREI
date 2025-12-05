import * as PIXI from "pixi.js";
import { Player } from "../player/Player";

export class CameraController {
  private app: PIXI.Application;
  private world: PIXI.Container;
  private target: Player;

  private worldScale = 1;
  private cameraX = 0;
  private cameraY = 0;
  private mapWidth = 0;
  private mapHeight = 0;

  constructor(app: PIXI.Application, world: PIXI.Container, target: Player) {
    this.app = app;
    this.world = world;
    this.target = target;
  }

  setWorldParams(scale: number, mapWidth: number, mapHeight: number) {
    this.worldScale = scale;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  update() {
    const playerScreenX = this.target.x * this.worldScale + this.world.x;
    const playerScreenY = this.target.y * this.worldScale + this.world.y;

    // --- zone morte centrée à l’écran
    const zoneWidth = this.app.screen.width / 3;
    const zoneHeight = this.app.screen.height / 3;
    const zoneLeft = (this.app.screen.width - zoneWidth) / 2;
    const zoneRight = zoneLeft + zoneWidth;
    const zoneTop = (this.app.screen.height - zoneHeight) / 2;
    const zoneBottom = zoneTop + zoneHeight;

    // --- limites de caméra
    const scaledW = this.mapWidth * this.worldScale;
    const scaledH = this.mapHeight * this.worldScale;
    const minCameraX = Math.min(0, this.app.screen.width - scaledW);
    const minCameraY = Math.min(0, this.app.screen.height - scaledH);
    const maxCameraX = 0;
    const maxCameraY = 0;

    // --- caméra : suit le joueur sauf aux bords
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
}
