import * as GUI from '@babylonjs/gui/2D';

/**
 * Class representing the button above the taco
 */
export default class Label {
  /**
   * @param {BABYLON.AdvancedDynamicTexture} advancedTexture
   * @param {BABYLON.Mesh} linkedMesh
   */
  constructor(advancedTexture, linkedMesh = null) {
    this.advancedTexture = advancedTexture;
    this.mainLabel = null;
    this.labelBg = null;
    this.linkedMesh = linkedMesh;
    this._addLabel();
  }

  /**
   * Adds the GUI elements
   * @private
   */
  _addLabel() {
    this.mainLabel = new GUI.Rectangle('taco label');
    const yellowColor = '#FFD800';

    this.mainLabel.width = '220px';
    this.mainLabel.height = '35px';
    this.mainLabel.color = yellowColor;
    this.mainLabel.cornerRadius = 20;

    const labelText = new GUI.TextBlock();

    labelText.text = 'PRESS AND HOLD';
    labelText.color = yellowColor;
    this.mainLabel.addControl(labelText);

    this.advancedTexture.addControl(this.mainLabel);

    this.labelBg = new GUI.Rectangle('');

    this.labelBg.thickness = 0;
    this.labelBg.background = yellowColor;
    this.labelBg.zIndex = -1;
    this.labelBg.height = '100%';
    this.labelBg.width = '0%';
    this.labelBg.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.mainLabel.addControl(this.labelBg);

    if (this.linkedMesh) {
      this.mainLabel.linkWithMesh(this.linkedMesh);
      this.mainLabel.linkOffsetY = -150;
    }
  }
}
