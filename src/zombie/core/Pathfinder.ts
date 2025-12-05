import * as PF from "pathfinding";

export class Pathfinder {
  private grid: PF.Grid;
  private finder: PF.AStarFinder;

  constructor(collisionObjects: { x: number; y: number; width: number; height: number }[], mapWidth: number, mapHeight: number, tileSize: number) {
    const cols = Math.floor(mapWidth / tileSize);
    const rows = Math.floor(mapHeight / tileSize);

    const matrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (const obj of collisionObjects) {
      const startCol = Math.floor(obj.x / tileSize);
      const endCol = Math.floor((obj.x + obj.width) / tileSize);
      const startRow = Math.floor(obj.y / tileSize);
      const endRow = Math.floor((obj.y + obj.height) / tileSize);

      for (let y = startRow; y < endRow; y++) {
        for (let x = startCol; x < endCol; x++) {
          if (matrix[y] && matrix[y][x] !== undefined) matrix[y][x] = 1;
        }
      }
    }

    this.grid = new PF.Grid(matrix);
    this.finder = new PF.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true,
    });
  }

  findPath(startX: number, startY: number, endX: number, endY: number, tileSize: number) {
    const gridBackup = this.grid.clone();

    const startXClamped = Math.max(0, Math.min(this.grid.width - 1, Math.floor(startX / tileSize)));
    const startYClamped = Math.max(0, Math.min(this.grid.height - 1, Math.floor(startY / tileSize)));
    const endXClamped = Math.max(0, Math.min(this.grid.width - 1, Math.floor(endX / tileSize)));
    const endYClamped = Math.max(0, Math.min(this.grid.height - 1, Math.floor(endY / tileSize)));

    const path = this.finder.findPath(
      startXClamped,
      startYClamped,
      endXClamped,
      endYClamped,
      gridBackup
    );

    return path.map(([x, y]) => ({
      x: x * tileSize + tileSize / 2,
      y: y * tileSize + tileSize / 2,
    }));
  }
}
