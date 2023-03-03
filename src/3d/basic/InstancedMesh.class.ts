import THREE from 'three';
import { meta } from '@/model';
import { queueTask } from '@/utils';

const _color = new THREE.Color();
const _identity = new THREE.Matrix4();
const _identity2 = new THREE.Matrix4();
const _vector3 = new THREE.Vector3();

const _empty = new THREE.Matrix4();
_empty.multiplyScalar(0);

let __instance__id__seed__ = 1990;
export class InstancedMesh extends THREE.InstancedMesh<any, THREE.Material> {
  private instances: Map<number, InstancedMesh> = new Map();
  private index2id: Map<number, number> = new Map();
  readonly isInstancedMeshInstance: boolean = false;
  readonly $$instanceOf: InstancedMesh = null;

  instanceIndex = -1;
  color: number;
  model: any;

  private total = 0;
  private removedTotal = 0;
  private indexTrash = [];
  private uniformColor = 0xffffff;

  constructor(geometry: THREE.BufferGeometry, material: THREE.Material, count: number) {
    super(geometry, material, count);

    this.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);

    const color = (material as THREE.MeshBasicMaterial).color?.getHex();

    if (color) this.uniformColor = color;

    _color.setHex(this.uniformColor);

    for (let i = 0; i < count; i++) {
      _color.toArray(this.instanceColor.array, i * 3);
    }
  }

  getInstanceAt(index: number) {
    for (const [_, instance] of this.instances) {
      if (instance.instanceIndex === index) {
        return instance;
      }
    }

    return null;
  }

  deleteInstanceAt(index: number) {
    const id = this.index2id.get(index);

    if (!id) return false;

    this.deleteInstance(id);

    return true;
  }

  deleteInstance(id: number) {
    const instance = this.instances.get(id);

    if (!instance) return;

    /**
     * not delete it actually, but give an empty matrix to hide it.
     */
    this.setMatrixAt(instance.instanceIndex, _empty);

    this.instances.delete(id);
    this.index2id.delete(instance.instanceIndex);

    this.removedTotal += 1;
    this.indexTrash.push(instance.instanceIndex);

    this.total -= 1;
  }

  delete() {
    this.deleteInstance(this.id);
  }

  private getNextIndex() {
    const index = this.indexTrash.shift();
    if (index !== undefined) return index;
    return this.total;
  }

  addInstance(position: meta.Position, rad = 0, color?: number) {
    const instance = this.createInstance();

    const { x, y, z } = position;

    const index = this.getNextIndex();

    _identity.makeTranslation(x, y, z);

    if (rad !== undefined && rad !== 0) {
      _identity2.makeRotationZ(rad);
      _identity.multiply(_identity2);
    }

    this.setMatrixAt(index, _identity);
    instance.position.set(x, y, z);

    if (color) {
      _color.setHex(color);
      this.setColorAt(index, _color);
      instance.color = color;
    }

    this.instances.set(instance.id, instance);
    instance.instanceIndex = index;

    this.index2id.set(index, instance.id);

    this.total += 1;

    return instance;
  }

  requestUpdate() {
    queueTask({
      key: 'updateInstancedMesh',
      run: 'markInstancesNeedUpdate',
      context: this,
    });
  }

  markInstancesNeedUpdate() {
    const total = this.total + this.removedTotal;

    this.instanceMatrix.updateRange = {
      offset: 0,
      // count is the count of components of a vector
      count: total * 16,
    };

    this.instanceColor.updateRange = {
      offset: 0,
      // count is the count of components of a vector
      count: total * 3,
    };

    this.instanceMatrix.needsUpdate = true;
    this.instanceColor.needsUpdate = true;
  }

  private createInstance(): this {
    const id = __instance__id__seed__++;
    // create
    const instance = Object.create(this, {
      id: {
        value: id,
        writable: false,
        configurable: false,
        enumerable: false,
      },
      position: {
        value: new THREE.Vector3(),
        writable: false,
        configurable: false,
        enumerable: false,
      },
      color: {
        value: this.uniformColor,
        writable: true,
        configurable: false,
        enumerable: false,
      },
    });

    instance.$$instanceOf = this;
    instance.isInstancedMeshInstance = true;
    instance.model = null;

    return instance;
  }

  setColor(color: number) {
    _color.set(color);
    this.setColorAt(this.instanceIndex, _color);
    this.color = color;
    this.instanceColor.needsUpdate = true;
  }

  getColor() {
    this.getColorAt(this.instanceIndex, _color);
    return _color.getHex();
  }

  override setColorAt(index: number, color: THREE.Color): void {
    color.toArray(this.instanceColor.array, index * 3);
  }
}
