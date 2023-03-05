import THREE from 'three';
import { Behavior } from '@/model';
import { InstancedMesh } from '../basic';
import { Warehouse3D } from '../Warehouse.class';

export class PointerReactBehavior extends Behavior {
  readonly raycaster: THREE.Raycaster = null;
  readonly pointer: THREE.Vector2 = null;

  private mousemove: (event: MouseEvent) => void;
  private mousedown: (event: MouseEvent) => void;
  private mouseup: (event: MouseEvent) => void;
  private mouseclick: (event: MouseEvent) => void;

  isMouseDown = false;
  isMouseMovedAfterDown = false;
  isPointerMoving = false;

  activatedObj3d: THREE.Object3D = null;
  intersection: THREE.Intersection<THREE.Object3D>;

  private domElement: HTMLCanvasElement = null;
  private userOnTick: () => void;

  constructor(private warehouse: Warehouse3D) {
    super();

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(0, 0);

    this.domElement = warehouse.renderer.domElement;
  }

  onLoad(): void {
    const { warehouse, domElement } = this;

    let mousemovestopTimer = null;

    const onmousemovestop = () => {
      this.isPointerMoving = false;
      mousemovestopTimer = null;
    };

    this.mousemove = (evt: MouseEvent) => {
      // calculate pointer position in normalized device coordinates
      // (-1 to +1) for both components
      evt.preventDefault();

      this.pointer.x = (evt.offsetX / domElement.clientWidth) * 2 - 1;
      this.pointer.y = -(evt.offsetY / domElement.clientHeight) * 2 + 1;

      this.isPointerMoving = true;

      clearTimeout(mousemovestopTimer);
      mousemovestopTimer = setTimeout(onmousemovestop, 50);

      if (!this.isMouseDown) return;

      this.isMouseMovedAfterDown = true;
    };

    this.mousedown = (mevt: MouseEvent) => {
      this.isMouseDown = true;

      if (this.activatedObj3d) {
        // mousdown
        console.log('obj is down');
        warehouse.fireBehavior('mousedown', this.activatedObj3d);
      } else {
        warehouse.fireBehavior('mousedown', this.warehouse.scene);
      }
    };

    this.mouseup = (mevt: MouseEvent) => {
      if (this.activatedObj3d) {
        // mouseup
        console.log('obj is up');
        if (this.isMouseMovedAfterDown) {
          warehouse.cancelClickEventFire();
        }
      } else {
        if (!this.isMouseMovedAfterDown) {
          console.log('noop click');
          warehouse.fireBehavior('click', warehouse.scene, null);
        }
      }

      if (!this.isMouseDown) return;

      this.isMouseDown = false;
      this.isMouseMovedAfterDown = false;
    };

    this.mouseclick = (mevt: MouseEvent) => {
      if (!this.activatedObj3d || warehouse.isClickEventFireCancelled) return;

      warehouse.fireBehavior('click', this.activatedObj3d);
    };

    const userOnTick = warehouse.onTick;

    this.userOnTick = userOnTick;

    const indicator = new THREE.Mesh(
      new THREE.SphereGeometry(1000),
      new THREE.MeshPhongMaterial({ color: 0xff4f00 }),
    );

    indicator.position.set(0, 0, 0);

    warehouse.scene.add(indicator);

    warehouse.onTick = () => {
      userOnTick && userOnTick();

      if (!this.isPointerMoving) return;

      let obj3d: THREE.Object3D = null;

      this.intersection = null;

      const intersections: THREE.Intersection[] = [];

      this.raycaster.setFromCamera(this.pointer, this.warehouse.camera);

      console.time('raycaster.intersectObjects');
      // The heavy run.
      for (const [_, list] of this.warehouse.typedLists) {
        const intersection = this.raycaster.intersectObjects([...list.items], false);
        if (intersection.length === 0) continue;
        intersections.push(intersection[0]);
      }
      console.timeEnd('raycaster.intersectObjects');

      // if hit one
      if (intersections.length > 0) {
        intersections.sort(ascSort);

        const intersection = intersections[0];

        obj3d = intersection.object;

        if (intersection.instanceId !== undefined && intersection.instanceId !== null) {
          obj3d = (obj3d as InstancedMesh).getInstanceAt(
            intersection.instanceId,
          ) as unknown as InstancedMesh;
        }

        this.intersection = intersection;
      }

      // Ray is an object re-use over and over again.

      // if (obj3d) {
      //   const intersection = this.raycaster.ray.intersectSphere(
      //     new THREE.Sphere(obj3d.position, 1000),
      //     new THREE.Vector3(),
      //   );

      //   if (intersection) {
      //     indicator.position.copy(intersection);
      //   }
      //   // console.log(intersection.x, intersection.y, intersection.z);
      // }

      console.log('you got:', obj3d);

      warehouse.fireBehavior('mousemove', obj3d || warehouse.scene);

      if (this.activatedObj3d === obj3d) {
        return;
      }

      if (this.activatedObj3d) {
        warehouse.fireBehavior('mouseout', this.activatedObj3d);
      }

      this.activatedObj3d = obj3d;

      if (obj3d) {
        warehouse.fireBehavior('mouseover', obj3d);
      }
    };

    domElement.addEventListener('mousemove', this.mousemove);
    domElement.addEventListener('mousedown', this.mousedown);
    domElement.addEventListener('mouseup', this.mouseup);
    domElement.addEventListener('click', this.mouseclick);
  }

  onUnload(): void {
    this.warehouse.onTick = this.userOnTick;
    this.domElement.removeEventListener('mousemove', this.mousemove);
    this.domElement.removeEventListener('mousedown', this.mousedown);
    this.domElement.removeEventListener('mouseup', this.mouseup);
    this.domElement.removeEventListener('click', this.mouseclick);
  }
}

const ascSort = (a, b) => {
  return a.distance - b.distance;
};
