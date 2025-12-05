export class InputController {
  private keys: Record<string, boolean> = {};
  private mouse = { x: 0, y: 0, clicked: false };
  private reloadKey = false;

  constructor() {
    this.init();
  }

  private init() {
    window.addEventListener("keydown", (e) => (this.keys[e.key.toLowerCase()] = true));
    window.addEventListener("keyup", (e) => (this.keys[e.key.toLowerCase()] = false));

    window.addEventListener("mousedown", () => (this.mouse.clicked = true));
    window.addEventListener("mouseup", () => (this.mouse.clicked = false));

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "r") this.reloadKey = true;
    });

    window.addEventListener("keyup", (e) => {
      if (e.key.toLowerCase() === "r") this.reloadKey = false;
    });
    
  }

  getDirection(speed: number) {
    let dx = 0, dy = 0;
    if (this.keys["arrowup"] || this.keys["z"]) dy -= speed;
    if (this.keys["arrowdown"] || this.keys["s"]) dy += speed;
    if (this.keys["arrowleft"] || this.keys["q"]) dx -= speed;
    if (this.keys["arrowright"] || this.keys["d"]) dx += speed;
    return { dx, dy };
  }

  isShooting() {
    return this.mouse.clicked;
  }

  getMousePosition() {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  shouldReload() {
    return this.reloadKey;
  }
}
