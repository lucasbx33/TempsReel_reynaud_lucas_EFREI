import { Projectile } from "./Projectile";
import { WeaponStats } from "./weapon";

export class WeaponSystem {
  public currentWeapon: WeaponStats | null;
  private player: any;
  
  ammo: number = 0;
  reserveAmmo: number = 0;

  cooldownTimer = 0;
  reloadTimer = 0;
  isReloading = false;

  projectiles: Projectile[] = [];
  collisions: any[] = [];

  constructor(player: any, defaultWeapon: WeaponStats | null, collisions: any[]) {
    this.player = player;
    this.currentWeapon = defaultWeapon;
    this.collisions = Array.isArray(collisions) ? collisions : [];

    if (defaultWeapon) {
      this.ammo = defaultWeapon.magSize;
      this.reserveAmmo = defaultWeapon.reserveAmmo;
      this.player.ownedWeapons.add(defaultWeapon.name);
    }
  }


  switchWeapon(weapon: WeaponStats) {
    this.currentWeapon = weapon;
    this.ammo = weapon.magSize;
    this.reserveAmmo = weapon.reserveAmmo;
    this.cooldownTimer = weapon.fireRate;
    this.isReloading = false;
    this.player.ownedWeapons.add(weapon.name);
  }

  update(delta: number) {
    if (this.isReloading) {
      this.reloadTimer += delta * 16;

      if (this.currentWeapon && this.reloadTimer >= this.currentWeapon.reloadTime) {
        const needed = this.currentWeapon.magSize - this.ammo;
        const loaded = Math.min(needed, this.reserveAmmo);

        this.ammo += loaded;
        this.reserveAmmo -= loaded;

        this.isReloading = false;
      }
      return;
    }

    this.cooldownTimer += delta * 16;
  }

  tryShoot(x: number, y: number, tx: number, ty: number) {
    if (!this.currentWeapon) return null;
    if (this.isReloading) return null;
    if (this.cooldownTimer < this.currentWeapon.fireRate) return null;
    if (this.ammo <= 0) return null;

    this.cooldownTimer = 0;
    this.ammo--;

    const p = new Projectile(
      x,
      y,
      tx,
      ty,
      this.currentWeapon.damage,
      this.currentWeapon.projectileSpeed,
      this.collisions
    );

    this.projectiles.push(p);
    return p;
  }

  reload() {
    if (!this.currentWeapon) return;
    if (this.isReloading) return;
    if (this.ammo === this.currentWeapon.magSize) return;
    if (this.reserveAmmo <= 0) return;

    this.isReloading = true;
    this.reloadTimer = 0;
  }
}
