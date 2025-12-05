import * as PIXI from "pixi.js";

export class GameOverScreen {
  private container: PIXI.Container;
  private app: PIXI.Application;

  constructor(app: PIXI.Application, onRestart: () => void) {
    this.app = app;

    this.container = new PIXI.Container();
    this.container.visible = false;
    app.stage.addChild(this.container);

    const bg = new PIXI.Graphics()
      .rect(0, 0, app.screen.width, app.screen.height)
      .fill({ color: 0x000000, alpha: 0.7 });
    this.container.addChild(bg);

    const text = new PIXI.Text("GAME OVER", {
      fill: 0xff4444,
      fontSize: 56,
      fontFamily: "Arial",
      stroke: "#000"
    });
    text.x = app.screen.width / 2 - text.width / 2;
    text.y = 140;
    this.container.addChild(text);

    const restartBtn = new PIXI.Text("Rejouer", {
      fill: 0xffffff,
      fontSize: 36,
      fontFamily: "Arial",
      stroke: "#000"
    });
    restartBtn.x = app.screen.width / 2 - restartBtn.width / 2;
    restartBtn.y = 300;
    restartBtn.eventMode = "static";
    restartBtn.cursor = "pointer";
    this.container.addChild(restartBtn);

    restartBtn.on("pointerdown", () => onRestart());
  }

  show() {
    this.container.visible = true;
  }

  hide() {
    this.container.visible = false;
  }
}
