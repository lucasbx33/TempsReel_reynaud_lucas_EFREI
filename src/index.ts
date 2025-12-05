import * as PIXI from "pixi.js";
import { CompositeTilemap } from "@pixi/tilemap";
import { Player, PlayerController } from "./player";
import { Application } from "pixi.js";
import { Zombie } from "./zombie/Zombie";
import { Pathfinder } from "./zombie/core/Pathfinder";
import { Shop } from "./shop/Shop";
import { WaveManager } from "./wave/WaveManager";
import { GameOverScreen } from "./core/GameOver";
import { GameManager } from "./core/GameManager";
import { PauseScreen } from "./pause/PauseScreen";
import { WeaponSelectScreen } from "./ui/WeaponSelectScreen";
import { StartScreen } from "./ui/StartScreen";

const app = new Application();
await app.init({ background: "#1e1e1e", resizeTo: window });
document.getElementById("pixi-container")!.appendChild(app.canvas);

let zombies: Zombie[] = [];

const world = new PIXI.Container();
app.stage.addChild(world);

type CollisionObject = { x: number; y: number; width: number; height: number };

async function loadTiledMap(
  path: string
): Promise<{ tilemap: CompositeTilemap; collisions: CollisionObject[]; mapWidth: number; mapHeight: number }> {
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
  } else if (tileset.source) {
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
  } else {
    throw new Error("❌ Aucun tileset valide trouvé dans la carte Tiled");
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

      tilemap.tile(baseTexture, x, y, {
        u: tx,
        v: ty,
        tileWidth: tilewidth,
        tileHeight: tileheight,
      });
    });
  }

  const collisionLayer = mapData.layers.find((l: any) => l.name === "collisions");
  const collisions: CollisionObject[] =
    collisionLayer?.objects?.map((o: any) => ({
      x: o.x,
      y: o.y,
      width: o.width,
      height: o.height,
    })) ?? [];

  const mapWidth = mapData.width * tilewidth;
  const mapHeight = mapData.height * tileheight;

  console.log("✅ Carte Tiled chargée :", imagePath, collisions.length, "zones");

  return { tilemap, collisions, mapWidth, mapHeight };
}

const { tilemap, collisions, mapWidth, mapHeight } = await loadTiledMap("map.tmj");
world.addChild(tilemap);

const desiredZoom = 2;
world.scale.set(desiredZoom);

world.x = (app.screen.width - mapWidth * desiredZoom) / 2;
world.y = (app.screen.height - mapHeight * desiredZoom) / 2;

const player = new Player(collisions);
await player.init();
player.x = mapWidth / 2;
player.y = mapHeight / 2;
world.addChild(player);

GameManager.pause();

const startScreen = new StartScreen(app, () => {
  if ((weaponSelect as any).show) {
    (weaponSelect as any).show();
  }
});

startScreen.show();

let weaponSelect: WeaponSelectScreen;

weaponSelect = new WeaponSelectScreen(app, (chosenWeapon) => {
  console.log("🔫 Weapon chosen:", chosenWeapon.name);

  player.weapon.switchWeapon(chosenWeapon);

  GameManager.resume();
});

const tileSize = 32;
const pathfinder = new Pathfinder(collisions, mapWidth, mapHeight, tileSize);

const waveManager = new WaveManager(() => {
  spawnZombies(waveManager.totalToSpawn);
});
waveManager.startNextWave();

waveManager.onWaveCompleted = () => {
  GameManager.pause();
  shop.open();
};

const shop = new Shop(app, player, waveManager, () => {
  GameManager.resume();
  waveManager.startNextWave();
});

const gameOver = new GameOverScreen(app, () => {
  window.location.reload();
});

type Score = {
  wave: number;
  date: string;
};

player.onDeath = () => {
  GameManager.pause();

  const newScore = {
    wave: waveManager.currentWave,
    date: new Date().toISOString(),
  };

  // Récupère les scores existants
  let scores = JSON.parse(localStorage.getItem("scores") || "[]");

  // Ajoute le nouveau score
  scores.push(newScore);

  // Trie les scores du meilleur au pire
  scores.sort((a: Score, b: Score) => b.wave - a.wave);

  // Garde seulement les 5 meilleurs
  scores = scores.slice(0, 5);

  // Sauvegarde
  localStorage.setItem("scores", JSON.stringify(scores));

  gameOver.show();
};

const pauseScreen = new PauseScreen(app, () => {
  console.log("➡️ Jeu repris depuis pause !");
});

function isPositionInsideCollision(x: number, y: number, collisions: any[]) {
  for (const c of collisions) {
    if (
      x > c.x &&
      x < c.x + c.width &&
      y > c.y &&
      y < c.y + c.height
    ) {
      return true;
    }
  }
  return false;
}

function spawnZombies(count: number) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {

      let spawnX, spawnY;
      let attempts = 0;

      do {
        spawnX = player.x + (Math.random() * 600 - 300);
        spawnY = player.y + (Math.random() * 600 - 300);
        attempts++;
      } while (isPositionInsideCollision(spawnX, spawnY, collisions) && attempts < 20);

      if (attempts >= 20) {
        console.warn("⚠ Impossible de trouver un spawn safe");
        return;
      }

      const z = new Zombie(player, pathfinder);
      z.x = spawnX;
      z.y = spawnY;

      const originalDie = z.die.bind(z);
      z.die = () => {
        originalDie();
        waveManager.onZombieKilled();
        zombies = zombies.filter((zm) => zm !== z);
      };

      zombies.push(z);
      world.addChild(z);

    }, i * 400);
  }
}

const controller = new PlayerController(
  app,
  world,
  player,
  collisions,
  desiredZoom,
  world.x,
  world.y,
  mapWidth,
  mapHeight
);

app.ticker.add((t) => {
  coinsText.text = `${player.coins} 💰`;
  ammoText.text = `${player.weapon.ammo} / ${player.weapon.reserveAmmo}`;
  reloadHint.visible =
    player.weapon.currentWeapon !== null &&
    player.weapon.ammo < player.weapon.currentWeapon.magSize;

  if (GameManager.paused) return;

  const delta = t.deltaTime;

  zombies.forEach((z) => {
    if (!z.dead && !z.destroyed) z.update(delta, zombies);
  });

  player.weapon.update(delta);

  player.weapon.projectiles = player.weapon.projectiles.filter((projectile) => {
    projectile.update(delta);

    if (projectile.dead) {
      projectile.destroy();
      return false;
    }

    for (const z of zombies) {
      if (z.dead || (z as any).destroyed) continue;

      const hb = z.getHitbox();

      if (
        projectile.x > hb.x &&
        projectile.x < hb.x + hb.width &&
        projectile.y > hb.y &&
        projectile.y < hb.y + hb.height
      ) {
        z.takeDamage(projectile.damage);
        projectile.dead = true;
        break;
      }
    }

    if (projectile.dead) {
      projectile.destroy();
      return false;
    }

    return true;
  });

});

const hud = new PIXI.Container();
app.stage.addChild(hud);

const ammoText = new PIXI.Text({
  text: "8 / 40",
  style: { fill: 0xffffff, fontSize: 20, fontFamily: "Arial" }
});
hud.addChild(ammoText);

const reloadHint = new PIXI.Text({
  text: "Appuyez sur R pour recharger",
  style: { fill: 0xff4444, fontSize: 16, fontFamily: "Arial" }
});
hud.addChild(reloadHint);

const coinsText = new PIXI.Text({
  text: "0 💰",
  style: { fill: 0xffd700, fontSize: 22, fontFamily: "Arial" }
});
hud.addChild(coinsText);

const waveText = new PIXI.Text(
  "Wave 1",
  new PIXI.TextStyle({
    fill: 0xffffff,
    fontSize: 26,
    fontFamily: "Arial",
    stroke: "#000000",
  })
);
hud.addChild(waveText);

const pauseBtn = new PIXI.Text("II", {
    fill: 0xffffff,
    fontSize: 28,
    fontFamily: "Arial",
    stroke: "#000"
});
pauseBtn.x = app.screen.width - 50;
pauseBtn.y = 20;
pauseBtn.eventMode = "static";
pauseBtn.cursor = "pointer";

hud.addChild(pauseBtn);

pauseBtn.on("pointerdown", () => {
    GameManager.pause();
    pauseScreen.show();
});


function updateHudPosition() {
  coinsText.x = 20;
  coinsText.y = 20;

  ammoText.x = 20;
  ammoText.y = app.screen.height - 70;

  reloadHint.x = 20;
  reloadHint.y = app.screen.height - 45;

  waveText.x = app.screen.width / 2 - 60;
  waveText.y = 20;

  pauseBtn.x = app.screen.width - 50;
  pauseBtn.y = 20;
}

updateHudPosition();
window.addEventListener("resize", updateHudPosition);

app.ticker.add(() => {
  waveText.text = `Wave ${waveManager.currentWave}`;
});
