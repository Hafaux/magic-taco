import gsap from 'gsap';
import * as GUI from '@babylonjs/gui/2D';

/**
 * Class representing the waves coming out of the taco.
 */
export default class Waves {
  /**
   * @param {BABYLON.AdvancedDynamicTexture} advancedTexture
   */
  constructor(advancedTexture, linkedMesh = null) {
    this.advancedTexture = advancedTexture;
    this.linkedMesh = linkedMesh;

    this.interval = this._addWavesInterval();
  }

  /**
   * Adds the wave interval.
   * @returns {Number}
   */
  _addWavesInterval() {
    return setInterval(() => {
      const ellipse = new GUI.Ellipse();
      const yellowColor = '#FFD800';

      const ellipseInfo = { circleSize: 100, thickness: 6 };

      ellipse.width = `${ellipseInfo.circleSize}px`;
      ellipse.height = `${ellipseInfo.circleSize}px`;
      ellipse.color = yellowColor;
      ellipse.thickness = ellipseInfo.thickness;
      ellipse.alpha = 0;

      this.advancedTexture.addControl(ellipse);

      if (this.linkedMesh) {
        ellipse.linkWithMesh(this.linkedMesh);
        ellipse.linkOffsetY = -30;
      }

      gsap.to(ellipse, {
        alpha: 0.4,
        yoyo: true,
        repeat: 2,
        duration: 1.5,
      });

      gsap.to(ellipseInfo, {
        circleSize: 200,
        thickness: 0,
        duration: 3,
        onUpdate: () => {
          ellipse.width = `${ellipseInfo.circleSize}px`;
          ellipse.height = `${ellipseInfo.circleSize}px`;
          ellipse.thickness = ellipseInfo.thickness;
        },
        onComplete: () => {
          this.advancedTexture.removeControl(ellipse);
        },
      });
    }, 1500);
  }
}
