import { Assets } from "pixi.js";
import { CompositeTilemap } from "@pixi/tilemap";

export async function loadTiledMap(path: string): Promise<CompositeTilemap> {
  const mapData = await (await fetch(path)).json();
  const tileset = mapData.tilesets[0];

  // Récupère le chemin de l’image du tileset
  const imagePath = `/assets/${tileset.image.split("/").pop()}`;
  const baseTexture = await Assets.load(imagePath);

  const tilemap = new CompositeTilemap();
  const columns = tileset.imagewidth / tileset.tilewidth;

  // Charge tous les layers Tiled (pas qu’un seul)
  for (const layer of mapData.layers) {
    if (layer.type !== "tilelayer") continue;

    layer.data.forEach((tileIndex: number, i: number) => {
      if (tileIndex === 0) return;

      const tileId = tileIndex - 1;
      const tx = (tileId % columns) * tileset.tilewidth;
      const ty = Math.floor(tileId / columns) * tileset.tileheight;

      const x = (i % mapData.width) * tileset.tilewidth;
      const y = Math.floor(i / mapData.width) * tileset.tileheight;

      tilemap.tile(baseTexture, x, y, {
        u: tx,
        v: ty,
        tileWidth: tileset.tilewidth,
        tileHeight: tileset.tileheight,
      });
    });
  }

  return tilemap;
}
