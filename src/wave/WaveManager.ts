export class WaveManager {
  currentWave = 0;
  zombiesToSpawn = 0;
  zombiesAlive = 0;

  // Appelé quand une vague est finie → shop s’ouvre dans index
  onWaveCompleted: () => void = () => {};

  private spawnCallback: () => void;

  constructor(spawnCallback: () => void) {
    this.spawnCallback = spawnCallback;
  }

  startNextWave() {
    this.currentWave++;
    this.zombiesToSpawn = 5 + (this.currentWave - 1) * 2;
    this.zombiesAlive = this.zombiesToSpawn;

    console.log(`🌊 Nouvelle vague : ${this.currentWave}`);
    this.spawnCallback();
  }

  onZombieKilled() {
    this.zombiesAlive--;
    if (this.zombiesAlive <= 0) {
      console.log(`✔ Vague ${this.currentWave} terminée !`);
      setTimeout(() => this.onWaveCompleted(), 1000);
    }
  }

  get waveNumber() {
    return this.currentWave;
  }

  get remaining() {
    return this.zombiesAlive;
  }

  get totalToSpawn() {
    return this.zombiesToSpawn;
  }
}
