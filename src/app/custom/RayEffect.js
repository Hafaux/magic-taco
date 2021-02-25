import { SpriteManager, Sprite, Color4 } from '@babylonjs/core';
import flareImg from '../../assets/flare1.png';
import gsap from 'gsap';

/**
 * Class representing the sun rays effect behind the taco.
 */
export default class RayEffect {
  constructor({ x = 0, y = 0 } = {}) {
    this.pos = { x, y };
    this.sprites = [];
    this.timeline = null;

    this._init();
  }

  /**
   * @private
   */
  _init() {
    const spriteManagerFlare = new SpriteManager('flareManager', flareImg, 4, { width: 850, height: 773 });
    const flare1 = new Sprite('flare', spriteManagerFlare);

    flare1.width = 1.5;
    flare1.height = 1.5;
    flare1.position.x = this.pos.x;
    flare1.position.y = this.pos.y + 0.2;
    flare1.position.z = 0.5;

    flare1.color = new Color4(1, 1, 1, 1);

    const flare2 = new Sprite('flare', spriteManagerFlare);

    this.sprites.push(flare1, flare2);

    flare2.width = 0.5;
    flare2.height = 0.5;
    flare2.position.x = this.pos.x;
    flare2.position.y = this.pos.y + 0.2;
    flare2.position.z = 0.5;
    flare2.angle = 0.5;

    this._startAnimation();
  }

  /**
   * @private
   */
  _startAnimation() {
    this.timeline = new gsap.timeline();

    this.timeline.to(this.sprites[0], {
      width: 0.5,
      height: 0.5,
      yoyo: true,
      repeat: -1,
      duration: 2,
      ease: 'power1.in',
    });

    this.timeline.to(this.sprites[1], {
      width: 1.5,
      height: 1.5,
      yoyo: true,
      repeat: -1,
      duration: 2,
    }, '<');
  }
}
