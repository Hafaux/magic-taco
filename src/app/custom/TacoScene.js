import {
  Color4,
  Engine,
  Scene,
  UniversalCamera,
  Vector3,
  DirectionalLight,
} from '@babylonjs/core';
import * as GUI from '@babylonjs/gui/2D';
import gsap from 'gsap';
import magicSound from '../../assets/magic.wav';
import RayEffect from './RayEffect';
import Label from './Label';
import Waves from './Waves';
import Particles from './Particles';
import Taco from './Taco';
import { Howl } from 'howler';

/**
 * Class representing the whole scene containing the taco.
 */
export default class TacoScene {
  /**
   * @param {HTMLCanvasElement} canvas html canvas element
   * @param {Object} canvasPos taco position
   */
  constructor(canvas, canvasPos = { left: '0px', top: '0px' }) {
    this.container = canvas;
    this.canvasCenter = null;

    this.canvasPos = canvasPos;

    this.engine = new Engine(this.container, true);
    this.scene = new Scene(this.engine);
    this.camera = new UniversalCamera('cam', new Vector3(0, 0.6, -3.5), this.scene);

    this.lights = [];
    this.taco = null;
    this.sound = null;
    this.particleSystem = null;
    this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('label', false);
    this.label = null;
    this.waves = null;
    this.rays = new RayEffect();

    this._init();
  }

  /**
   * Gets the center coord of the canvas
   * @private
   */
  _getCanvasCenter() {
    const canvasRect = this.container.getBoundingClientRect();

    return {
      x: canvasRect.x + (canvasRect.width / 2),
      y: canvasRect.y + (canvasRect.height / 2),
    };
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
    this.container.style.width = '300px';
    this.container.style.height = '300px';
    this.container.id = 'gameCanvas';

    this.container.style.position = 'absolute';
    this.container.style.outline = 'none';
    this.container.style.left = this.canvasPos.left;
    this.container.style.top = this.canvasPos.top;

    document.body.appendChild(this.container);

    this.canvasCenter = this._getCanvasCenter();
  }

  /**
   * Updates the direction where the sound is coming from relative to the taco.
   * @private
   */
  _updateSoundDirection(event) {
    const relativePos = {
      x: -(event.x - this.canvasCenter.x) / window.innerWidth,
      y: (event.y - this.canvasCenter.y) / window.innerWidth,
    };
    const volume = 1 - (Math.abs(relativePos.x) + Math.abs(relativePos.y));

    this.sound.volume(volume * volume);
    this.sound.pos(relativePos.x, relativePos.y, -0.5, this.sound._getSoundIds()[0]);
  }

  /**
   * Adds the lights to the scene.
   * @private
   */
  _addLights() {
    this.lights = [
      new DirectionalLight('dir01', new Vector3(0.5, -1, 2), this.scene),
      new DirectionalLight('dir02', new Vector3(-1.5, 1, 2), this.scene),
    ];

    this.lights[0].intensity = 15;
    this.lights[1].intensity = 5;
  }

  /**
   * Loads the taco into the scene and adds the pointer events callbacks
   * @private
   * @returns {Promise}
   */
  async _addTaco() {
    this.taco = new Taco(this.scene);

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
    this.sound = new Howl({ src: magicSound, loop: true, autoplay: true });
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

      if (this.taco.rotationTween) this.taco.rotationTween.pause();

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

      gsap.to(dummyObj, {
        volume: 0,
        onUpdate: () => {
          this.sound.volume(dummyObj.volume);
        },
        onComplete: () => {
          this.sound.stop();
        },
      });
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
      onComplete: () => {
        this.engine.stopRenderLoop();
        document.body.removeChild(this.container);
      },
    });
  }

  /**
   * Called on a pointerup event.
   * @private
   */
  _onPointerUp() {
    if (this.bgTween) this.bgTween.kill();
    if (this.taco.rotationTween) this.taco.rotationTween.play();

    this.bgTween = gsap.to(this.label.labelBg, {
      width: '0%',
      duration: 0.2,
      ease: 'linear',
    });
  }
}
