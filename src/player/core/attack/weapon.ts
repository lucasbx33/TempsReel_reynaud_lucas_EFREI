export interface WeaponStats {
  name: string;
  damage: number;
  projectileSpeed: number;

  magSize: number;
  reserveAmmo: number;

  fireRate: number;
  reloadTime: number;
}

export const Weapons = {
  Glock: {
    name: "Glock",
    damage: 20,
    projectileSpeed: 8,
    magSize: 8,
    reserveAmmo: 40,
    fireRate: 300,
    reloadTime: 900,
  } as WeaponStats,

  AK47: {
    name: "AK-47",
    damage: 15,
    projectileSpeed: 12,
    magSize: 30,
    reserveAmmo: 90,
    fireRate: 120,
    reloadTime: 1500,
  } as WeaponStats,

  Shotgun: {
    name: "Shotgun",
    damage: 40,
    projectileSpeed: 7,
    magSize: 2,
    reserveAmmo: 20,
    fireRate: 600,
    reloadTime: 2000,
  } as WeaponStats,
};
