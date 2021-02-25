import { ParticleHelper, NoiseProceduralTexture, Vector3, Color4 } from '@babylonjs/core';

/**
 * Class representing the taco particles.
 */
export default class Particles {
  /**
   * 
   * @param {BABYLON.Mesh} emitter mesh or position from where the particles will emit
   * @param {BABYLON.Scene} scene babylon scene
   */
  constructor(emitter, scene) {
    this.emitter = emitter;
    this.particleSystem = null;
    this.scene = scene;

    this._initParticles();
  }

  /**
   * Initializes the particle system.
   * @private
   */
  _initParticles() {
    this.particleSystem = ParticleHelper.CreateDefault(this.emitter);
    const noiseTexture = new NoiseProceduralTexture('perlin', 256, this.scene);

    noiseTexture.animationSpeedFactor = 5;
    noiseTexture.persistence = 2;
    noiseTexture.brightness = 0.5;
    noiseTexture.octaves = 5;

    this.particleSystem.noiseStrength = new Vector3(5, 10, 5);
    this.particleSystem.noiseTexture = noiseTexture;

    this.particleSystem.emitRate = 100;
    this.particleSystem.minEmitPower = 0.2;
    this.particleSystem.maxEmitPower = 0.2;
    this.particleSystem.updateSpeed = 0.005;

    this.particleSystem.minLifeTime = 0.4;
    this.particleSystem.maxLifeTime = 0.4;
    this.particleSystem.minSize = 0.02;
    this.particleSystem.maxSize = 0.02;

    this.particleSystem.colorDead = new Color4(0.2, 0.2, 0, 0);
    this.particleSystem.direction1 = new Vector3(-1, 4, 1);
    this.particleSystem.direction2 = new Vector3(1, 4, -1);

    this.particleSystem.start();
  }
}
