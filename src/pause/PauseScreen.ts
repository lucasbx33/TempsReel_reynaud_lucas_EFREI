import * as PIXI from "pixi.js";
import { GameManager } from "../core/GameManager";

export class PauseScreen {
    private container: PIXI.Container;
    private app: PIXI.Application;
    private onResume: () => void;

    constructor(app: PIXI.Application, onResume: () => void) {
        this.app = app;
        this.onResume = onResume;

        this.container = new PIXI.Container();
        this.container.visible = false;
        app.stage.addChild(this.container);

        this.buildUI();
    }

    private buildUI() {
        const bg = new PIXI.Graphics()
            .rect(0, 0, this.app.screen.width, this.app.screen.height)
            .fill({ color: 0x000000, alpha: 0.6 });

        this.container.addChild(bg);

        const title = new PIXI.Text("PAUSE", {
            fill: 0xffffff,
            fontSize: 60,
            fontFamily: "Arial",
            stroke: "#000"
        });
        title.x = this.app.screen.width / 2 - title.width / 2;
        title.y = 120;
        this.container.addChild(title);

        const resumeBtn = new PIXI.Text("Reprendre", {
            fill: 0xffff00,
            fontSize: 36,
            fontFamily: "Arial",
        });
        resumeBtn.x = this.app.screen.width / 2 - resumeBtn.width / 2;
        resumeBtn.y = 280;
        resumeBtn.eventMode = "static";
        resumeBtn.cursor = "pointer";
        resumeBtn.on("pointerdown", () => this.resume());
        this.container.addChild(resumeBtn);
    }

    show() {
        this.container.visible = true;
    }

    resume() {
        GameManager.resume();
        this.container.visible = false;
        this.onResume();
    }
}
