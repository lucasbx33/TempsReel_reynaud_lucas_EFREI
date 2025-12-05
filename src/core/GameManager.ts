export class GameManager {
    static paused = false;

    static pause() {
        this.paused = true;
    }

    static resume() {
        this.paused = false;
    }

    static toggle() {
        this.paused = !this.paused;
    }
}
