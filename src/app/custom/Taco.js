import { SceneLoader, Vector3, Matrix, Mesh } from '@babylonjs/core';
import gsap from 'gsap/gsap-core';
import tacoModel from '../../assets/taco.glb';
import config from '../../config';

/**
 * Class representing the taco.
 */
export default class Taco {
  /**
   * @param {BABYLON.Scene} scene babylon scene
   * @param {Object} pos taco position
   */
  constructor(scene, { x = 0, y = 0 } = {}) {
    this.scene = scene;
    this.tacoPos = { x, y };
    this.mesh = null;
    this.rotationTween = null;
    this.loadingPromise = this._loadTaco();
  }

  /**
   * Loads the taco model and sets its position.
   * @private
   */
  async _loadTaco() {
    const { meshes: [tacoMesh] } = await SceneLoader.ImportMeshAsync(null, '', tacoModel, this.scene);

    const tacoParent = Mesh.CreateBox('taco-parent', 1, this.scene);

    tacoParent.isVisible = false;

    this.mesh = tacoMesh;
    this.mesh.parent = tacoParent;

    this.mesh.position.x = 0;
    this.mesh.position.y = 0;
    this.mesh.rotation = new Vector3(0, 0, 0);

    this._setTacoPosition(this.tacoPos.x, this.tacoPos.y);

    const dummyObj = { dummyVal: 0 };

    this.rotationTween = gsap.to(dummyObj, {
      dummyVal: 1,
      repeat: -1,
      onUpdate: () => {
        this.mesh.parent.rotation.y += config.rotationSpeed;
      },
    });
  }

  /**
   * Sets the taco's position and rotation.
   * @param {Number} x x position of the taco mesh
   * @param {Number} y y position of the taco mesh
   * @param {Number} pitch pitch of the mesh
   * @param {Number} yaw yaw of the mesh
   * @param {Number} roll roll of the mesh
   * @private
   */
  _setTacoPosition(x = 0, y = -0.5, pitch = 0, yaw = Math.PI / 1.3, roll = -0.2) {
    this.mesh.parent.rotation = new Vector3(pitch, yaw, roll);
    this.mesh.parent.position.x = x;
    this.mesh.parent.position.y = y;
  }

  /**
   * Returns true if the mouse is over the taco.
   * @returns {Boolean}
   */
  isHit() {
    const ray = this.scene.createPickingRay(
      this.scene.pointerX,
      this.scene.pointerY,
      Matrix.Identity(),
      this.camera,
    );
    const pickingInfo = this.scene.pickWithRay(ray);

    return pickingInfo.hit && pickingInfo.pickedMesh.name === 'taco';
  }
}
