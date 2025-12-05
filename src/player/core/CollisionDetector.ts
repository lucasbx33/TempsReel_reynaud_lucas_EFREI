import { CollisionObject } from "./types";

export class CollisionDetector {
  constructor(private collisions: CollisionObject[]) {}

  isColliding(box: { x: number; y: number; width: number; height: number }): boolean {
    return this.collisions.some(
      (obj) =>
        box.x < obj.x + obj.width &&
        box.x + box.width > obj.x &&
        box.y < obj.y + obj.height &&
        box.y + box.height > obj.y
    );
  }
}
