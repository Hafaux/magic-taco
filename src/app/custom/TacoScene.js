import {
  Color4,
  Engine,
  Scene,
  UniversalCamera,
  Vector3,
  DirectionalLight,
  Sound,
} from '@babylonjs/core';
import * as GUI from '@babylonjs/gui/2D';
import gsap from 'gsap';
import magicSound from '../../assets/magic.wav';
import RayEffect from './RayEffect';
import Label from './Label';
import Waves from './Waves';
import Particles from './Particles';
import Taco from './Taco';

/**
 * Class representing the whole scene containing the taco.
 */
export default class TacoScene {
  /**
   * @param {HTMLCanvasElement} canvas html canvas element
   * @param {Object} tacoPos taco position
   */
  constructor(canvas, tacoPos = { x: 0, y: 0 }) {
    this.container = canvas;

    this.tacoPos = tacoPos;

    this.engine = new Engine(this.container, true);
    this.scene = new Scene(this.engine);
    this.camera = new UniversalCamera('cam', new Vector3(0, 0.6, -8), this.scene);

    this.lights = [];
    this.taco = null;
    this.sound = null;
    this.particleSystem = null;
    this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('label', false);
    this.label = null;
    this.waves = null;
    this.rays = new RayEffect(this.tacoPos);

    this._init();
  }

  /**
   * Initializes the scene.
   * @private
   * @returns {Promise}
   */
  async _init() {
    this._appendCanvas();

    this.scene.clearColor = new Color4(0, 0, 0, 0);

    this.engine.resize();
    window.addEventListener('resize', () => this.engine.resize());

    this._addLights();
    await this._addTaco();
    this.label = new Label(this.advancedTexture, this.taco.mesh.parent);
    this.waves = new Waves(this.advancedTexture, this.taco.mesh.parent);
    this._addParticles();
    this._addSound();

    window.addEventListener('pointermove', this._updateSoundDirection.bind(this));
    this.engine.runRenderLoop(() => this.scene.render());
  }

  /**
   * Appends the canvas to the DOM.
   * @private
   */
  _appendCanvas() {
    this.container.style.width = '100vw';
    this.container.style.height = '100vh';
    this.container.id = 'gameCanvas';

    document.body.appendChild(this.container);
  }

  /**
   * Updates the direction where the sound is coming from relative to the taco.
   * @private
   */
  _updateSoundDirection() {
    const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
    const ray = pickResult.ray;
    const distance = 30;
    const pos = {
      x: ray.origin.x + (ray.direction.x * distance),
      y: ray.origin.y + (ray.direction.y * distance),
    };

    this.scene.audioListenerPositionProvider = () => new Vector3(pos.x, pos.y, -3);
  }

  /**
   * Adds the lights to the scene.
   * @private
   */
  _addLights() {
    this.lights = [
      new DirectionalLight('dir01', new Vector3(0.5, -1, 2), this.scene),
    ];

    this.lights[0].intensity = 15;
  }

  /**
   * Loads the taco into the scene and adds the pointer events callbacks
   * @private
   * @returns {Promise}
   */
  async _addTaco() {
    this.taco = new Taco(this.scene, this.tacoPos);

    await this.taco.loadingPromise;

    this.scene.onPointerDown = this._onPointerDown.bind(this);
    this.scene.onPointerUp = this._onPointerUp.bind(this);
  }

  /**
   * Adds the particles coming from the taco.
   * @private
   */
  _addParticles() {
    const particles = new Particles(this.taco.mesh, this.scene);

    this.particleSystem = particles.particleSystem;
  }

  /**
   * Adds the magic sound and attaches it to the taco mesh.
   * @private
   */
  _addSound() {
    this.sound = new Sound('magic', magicSound, this.scene, null, {
      loop: true,
      autoplay: true,
      spatialSound: true,
      distanceModel: 'exponential',
      rolloffFactor: 1,
    });

    this.sound.attachToMesh(this.taco.mesh.parent);
  }

  /**
   * Called on a pointerdown event.
   * @private
   */
  _onPointerDown() {
    if (this.taco.isHit()) {
      if (this.bgTween) this.bgTween.kill();
      const dummyObj = {
        shakeIntensity: 0,
      };

      gsap.to(dummyObj, { shakeIntensity: 0.05, duration: 3 });

      this.bgTween = gsap.to(this.label.labelBg, {
        width: '100%',
        duration: 3,
        ease: 'linear',
        onUpdate: () => {
          this.taco.mesh.position.x = Math.random() * dummyObj.shakeIntensity;
          this.taco.mesh.position.y = (Math.random() * dummyObj.shakeIntensity);
          this.taco.mesh.rotation = new Vector3(
            Math.random() * dummyObj.shakeIntensity,
            (Math.random() * dummyObj.shakeIntensity),
            (Math.random() * dummyObj.shakeIntensity),
          );
        },
        onComplete: this._onHoldComplete.bind(this),
      });
    }
  }

  /**
   * Called when the user clicks and holds the taco for 3 seconds.
   * @private
   */
  _onHoldComplete() {
    const tacoMesh = this.taco.mesh.getChildMeshes()[0];

    if (this.waves.interval) clearInterval(this.waves.interval);
    if (this.rays.timeline) this.rays.timeline.pause();
    if (this.particleSystem) this.particleSystem.stop();
    if (this.sound) {
      const dummyObj = { volume: 1 };

      gsap.to(dummyObj, { volume: 0, onUpdate: () => {
        this.sound.setVolume(dummyObj.volume);
      } });
    }

    gsap.to(tacoMesh, {
      visibility: 0,
    });

    gsap.to(this.taco.mesh.scaling, {
      x: 1.2,
      y: 1.2,
      z: 1.2,
    });

    gsap.to(this.rays.sprites, {
      width: 0,
      height: 0,
    });

    gsap.to(this.label.mainLabel, {
      alpha: 0,
    });
  }

  /**
   * Called on a pointerup event.
   * @private
   */
  _onPointerUp() {
    if (this.bgTween) this.bgTween.kill();
    this.bgTween = gsap.to(this.label.labelBg, {
      width: '0%',
      duration: 0.2,
      ease: 'linear',
    });
  }
}
