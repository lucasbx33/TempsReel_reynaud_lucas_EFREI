import { Zombie } from "../zombie/Zombie";
import * as PIXI from "pixi.js";

export class EnemySpawner {
  private world: PIXI.Container;
  private createZombie: () => Zombie;
  private spawnInterval = 1000;
  private intervalId: number | null = null;
  private spawned = 0;

  constructor(world: PIXI.Container, createZombie: () => Zombie) {
    this.world = world;
    this.createZombie = createZombie;
  }

  startSpawning(count: number) {
    this.spawned = 0;

    this.intervalId = window.setInterval(() => {
      if (this.spawned >= count) {
        clearInterval(this.intervalId!);
        this.intervalId = null;
        return;
      }

      const zombie = this.createZombie();
      this.world.addChild(zombie);

      this.spawned++;

    }, this.spawnInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
