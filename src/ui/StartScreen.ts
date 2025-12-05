// core/StartScreen.ts
import * as PIXI from "pixi.js";

export class StartScreen {
  app: PIXI.Application;
  container: PIXI.Container;
  onStart: () => void;

  constructor(app: PIXI.Application, onStart: () => void) {
    this.app = app;
    this.onStart = onStart;

    this.container = new PIXI.Container();
    this.container.visible = false;
    this.app.stage.addChild(this.container);
    this.container.zIndex = 10000;

    this.app.stage.setChildIndex(this.container, this.app.stage.children.length - 1);

    this.buildUI();

    // optionnel : s'adapter au resize
    window.addEventListener("resize", () => this.resize());
  }

  buildUI() {
  this.container.removeChildren();

  const bg = new PIXI.Graphics()
    .rect(0, 0, this.app.screen.width, this.app.screen.height)
    .fill(0x000000, 1);
  this.container.addChild(bg);

  // Titre
  const title = new PIXI.Text("ZOMBIE SURVIVOR", {
    fill: 0xffffff,
    fontSize: 48,
    fontFamily: "Arial",
    fontWeight: "bold"
  });
  title.anchor.set(0.5);
  title.x = this.app.screen.width / 2;
  title.y = 120;
  this.container.addChild(title);

  // Charger les scores
const raw = localStorage.getItem("scores");

if (raw) {
  const scores = JSON.parse(raw);

  let y = 190;

  const subtitle = new PIXI.Text("🏆 Top 5 des meilleures parties :", {
    fill: 0xffd700,
    fontSize: 26,
    fontFamily: "Arial",
    stroke: "#000",
  });
  subtitle.anchor.set(0.5);
  subtitle.x = this.app.screen.width / 2;
  subtitle.y = y;
  this.container.addChild(subtitle);

  y += 40;

  scores.forEach((s: any, index: number) => {
    const d = new Date(s.date);
    const dateStr = d.toLocaleDateString("fr-FR");

    const line = new PIXI.Text(
      `${index + 1}. Vague ${s.wave} — ${dateStr}`,
      {
        fill: 0xffffff,
        fontSize: 22,
        fontFamily: "Arial",
        stroke: "#000",
      }
    );

    line.anchor.set(0.5);
    line.x = this.app.screen.width / 2;
    line.y = y;
    y += 30;

    this.container.addChild(line);
  });
}


  const playBtn = new PIXI.Text("▶ JOUER", {
    fill: 0x00ff99,
    fontSize: 42,
    fontFamily: "Arial",
    fontWeight: "bold",
    stroke: "#000"
  });
  playBtn.anchor.set(0.5);
  playBtn.x = this.app.screen.width / 2;
  playBtn.y = this.app.screen.height / 2;
  playBtn.eventMode = "static";
  playBtn.cursor = "pointer";

  playBtn.on("pointerdown", () => {
    this.hide();
    this.onStart();
  });

  this.container.addChild(playBtn);
}


  resize() {
    this.buildUI();
  }

  show() {
    this.container.visible = true;
    this.container.eventMode = "static"; 
  }

  hide() {
    this.container.visible = false;
    this.container.eventMode = "none"; 
  }

}
