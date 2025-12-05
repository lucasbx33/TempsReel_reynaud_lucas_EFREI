import * as PIXI from "pixi.js";

export class CameraController {
  private cameraX = 0;
  private cameraY = 0;

  constructor(
    private app: PIXI.Application,
    private world: PIXI.Container,
    private worldScale: number,
    private worldOffsetX: number,
    private worldOffsetY: number,
    private mapWidth: number,
    private mapHeight: number
  ) {
    this.cameraX = worldOffsetX;
    this.cameraY = worldOffsetY;
  }

  updateCamera(player: PIXI.Container) {
    const scaledW = this.mapWidth * this.worldScale;
    const scaledH = this.mapHeight * this.worldScale;

    const playerScreenX = player.x * this.worldScale + this.world.x;
    const playerScreenY = player.y * this.worldScale + this.world.y;

    const zoneWidth = this.app.screen.width / 3;
    const zoneHeight = this.app.screen.height / 3;

    const zoneLeft = (this.app.screen.width - zoneWidth) / 2;
    const zoneRight = zoneLeft + zoneWidth;
    const zoneTop = (this.app.screen.height - zoneHeight) / 2;
    const zoneBottom = zoneTop + zoneHeight;

    // Limites caméra
    const minCameraX = this.app.screen.width - scaledW;
    const maxCameraX = 0;
    const minCameraY = this.app.screen.height - scaledH;
    const maxCameraY = 0;

    let targetCameraX = this.cameraX;
    let targetCameraY = this.cameraY;

    if (playerScreenX < zoneLeft && this.cameraX < maxCameraX)
      targetCameraX += (zoneLeft - playerScreenX);
    else if (playerScreenX > zoneRight && this.cameraX > minCameraX)
      targetCameraX -= (playerScreenX - zoneRight);

    if (playerScreenY < zoneTop && this.cameraY < maxCameraY)
      targetCameraY += (zoneTop - playerScreenY);
    else if (playerScreenY > zoneBottom && this.cameraY > minCameraY)
      targetCameraY -= (playerScreenY - zoneBottom);

    // Clamp + interpolation fluide
    const smoothness = 0.2;
    this.cameraX = Math.min(Math.max(targetCameraX, minCameraX), maxCameraX);
    this.cameraY = Math.min(Math.max(targetCameraY, minCameraY), maxCameraY);

    this.world.x += (this.cameraX - this.world.x) * smoothness;
    this.world.y += (this.cameraY - this.world.y) * smoothness;
  }
}
