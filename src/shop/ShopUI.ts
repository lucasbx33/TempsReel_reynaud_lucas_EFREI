import * as PIXI from "pixi.js";

export class ShopUI {
  public container: PIXI.Container;
  private app: PIXI.Application;

  constructor(app: PIXI.Application) {
    this.app = app;

    this.container = new PIXI.Container();
    this.container.visible = false;

    this.buildUI();
    app.stage.addChild(this.container);
  }

  private buildUI() {
    // Fond noir semi-transparent
    const bg = new PIXI.Graphics()
      .rect(0, 0, this.app.screen.width, this.app.screen.height)
      .fill({ color: 0x000000, alpha: 0.7 });
    this.container.addChild(bg);

    // Titre
    const title = new PIXI.Text("SHOP", {
      fill: 0xffffff,
      fontSize: 48,
      stroke: "#000",
    });
    title.x = this.app.screen.width / 2 - title.width / 2;
    title.y = 80;
    this.container.addChild(title);
  }

  createButton(text: string, y: number, fontSize = 28, color = 0xffff00) {
    const btn = new PIXI.Text(text, {
      fill: color,
      fontSize,
      fontFamily: "Arial",
      stroke: "#000",
    });

    btn.x = this.app.screen.width / 2 - btn.width / 2;
    btn.y = y;
    btn.eventMode = "static";
    btn.cursor = "pointer";

    this.container.addChild(btn);
    return btn;
  }

  show() {
    this.container.visible = true;
  }

  hide() {
    this.container.visible = false;
  }
}
