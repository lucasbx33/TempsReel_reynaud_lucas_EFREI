import * as PIXI from "pixi.js";
import { CompositeTilemap } from "@pixi/tilemap";

type CollisionObject = { x: number; y: number; width: number; height: number };

export class WorldManager {
  public world: PIXI.Container;
  public collisions: CollisionObject[] = [];
  public mapWidth = 0;
  public mapHeight = 0;
  public scale = 2;

  constructor(public app: PIXI.Application) {
    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);
  }

  async loadTiledMap(path: string) {
    const mapData = await (await fetch(path)).json();
    const tileset = mapData.tilesets[0];

    let imagePath: string;
    let imagewidth: number;
    let imageheight: number;
    let tilewidth: number;
    let tileheight: number;

    if (tileset.image) {
      imagePath = `/${tileset.image.split("/").pop()}`;
      imagewidth = tileset.imagewidth;
      imageheight = tileset.imageheight;
      tilewidth = tileset.tilewidth;
      tileheight = tileset.tileheight;
    } else {
      const tsxPath = path.replace(/[^/]+$/, "") + tileset.source;
      const tsxText = await (await fetch(tsxPath)).text();
      const tsx = new DOMParser().parseFromString(tsxText, "application/xml");
      const image = tsx.querySelector("image")!;
      imagePath = image.getAttribute("source")!;
      imagewidth = parseInt(image.getAttribute("width")!);
      imageheight = parseInt(image.getAttribute("height")!);
      const tsxRoot = tsx.querySelector("tileset")!;
      tilewidth = parseInt(tsxRoot.getAttribute("tilewidth")!);
      tileheight = parseInt(tsxRoot.getAttribute("tileheight")!);
    }

    if (!imagePath.startsWith("http") && !imagePath.startsWith("/")) {
      imagePath = `${path.replace(/[^/]+$/, "")}${imagePath}`;
    }

    const baseTexture = await PIXI.Assets.load(imagePath);
    const columns = imagewidth / tilewidth;
    const tilemap = new CompositeTilemap();

    for (const layer of mapData.layers) {
      if (layer.type !== "tilelayer") continue;
      layer.data.forEach((tileIndex: number, i: number) => {
        if (tileIndex === 0) return;
        const tileId = tileIndex - 1;
        const tx = (tileId % columns) * tilewidth;
        const ty = Math.floor(tileId / columns) * tileheight;
        const x = (i % mapData.width) * tilewidth;
        const y = Math.floor(i / mapData.width) * tileheight;
        tilemap.tile(baseTexture, x, y, { u: tx, v: ty, tileWidth: tilewidth, tileHeight: tileheight });
      });
    }

    const collisionLayer = mapData.layers.find((l: any) => l.name === "collisions");
    this.collisions =
      collisionLayer?.objects?.map((o: any) => ({
        x: o.x,
        y: o.y,
        width: o.width,
        height: o.height,
      })) ?? [];

    this.mapWidth = mapData.width * tilewidth;
    this.mapHeight = mapData.height * tileheight;

    // --- affichage du monde
    this.world.addChild(tilemap);
    this.world.scale.set(this.scale);
    this.world.x = (this.app.screen.width - this.mapWidth * this.scale) / 2;
    this.world.y = (this.app.screen.height - this.mapHeight * this.scale) / 2;

    console.log("✅ Carte Tiled chargée :", imagePath, this.collisions.length, "collisions");
  }
}
