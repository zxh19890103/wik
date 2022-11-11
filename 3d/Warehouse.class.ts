import THREE, { InstancedMesh } from 'three';
import { IDisposable } from '../interfaces/Disposable';
import { GraphicObject } from '../interfaces/GraghicObject';
import { IInjector } from '../interfaces/Injector';
import { IModeManager } from '../interfaces/Mode';
import { ISelectionManager } from '../interfaces/Selection';
import Interface from '../interfaces/symbols';
import { ClickCancelMix, WithClickCancel } from '../mixins/ClickCancel';
import { IWarehouse } from '../model';
import { Core, IList, inject, mixin, writeReadonlyProp } from '../model/basic';
import { event2behavior } from '../model/state';
import { DefaultBehavior } from './behaviors/DefaultBehavior.class';
import { Ground } from './Ground.class';
import { Object3DList } from './Object3DList.class';

@mixin(ClickCancelMix)
export abstract class Warehouse3D extends Core implements IWarehouse, IDisposable {
  readonly mounted: boolean = false;
  readonly layouted: boolean = false;
  readonly raycaster: THREE.Raycaster = null;
  readonly pointer: THREE.Vector2 = null;

  protected readonly scene: THREE.Scene;
  protected readonly camera: THREE.Camera = null;
  protected readonly renderer: THREE.Renderer = null;
  protected readonly domElement: HTMLCanvasElement = null;

  @inject(Interface.ISelectionManager)
  readonly selectionManager: ISelectionManager;
  @inject(Interface.IModeManager)
  readonly modeManager: IModeManager;
  readonly typedLists: Map<string, Object3DList<THREE.Object3D>> = new Map();

  private mousemove: (event: MouseEvent) => void;
  private mousedown: (event: MouseEvent) => void;
  private mouseup: (event: MouseEvent) => void;
  private mouseclick: (event: MouseEvent) => void;

  isMouseDown = false;
  isMouseMovedAfterDown = false;
  isPointerMoving = false;

  activatedObj3d: THREE.Object3D = null;
  intersection: THREE.Intersection<THREE.Object3D>;

  constructor() {
    super();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(0, 0);
  }

  abstract layout(data?: unknown): void | Promise<void>;

  ascSort = (a, b) => {
    return a.distance - b.distance;
  };

  tick() {
    this.onTick && this.onTick();

    if (!this.isPointerMoving) return;

    console.log('moving...');

    let obj3d: THREE.Object3D = null;

    this.intersection = null;

    const intersections: THREE.Intersection[] = [];

    this.raycaster.setFromCamera(this.pointer, this.camera);

    for (const [_, list] of this.typedLists) {
      const intersection = this.raycaster.intersectObjects([...list.items], false);
      if (intersection.length === 0) continue;
      intersections.push(intersection[0]);
    }

    // if hit one
    if (intersections.length > 0) {
      intersections.sort(this.ascSort);

      const intersection = intersections[0];

      obj3d = intersection.object;

      if ((obj3d as InstancedMesh).isInstancedMesh) {
        obj3d = (obj3d as any).getInstanceAt(intersection.instanceId);
      }

      this.intersection = intersection;
    }

    if (this.activatedObj3d === obj3d) return;

    if (this.activatedObj3d) {
      this.fireBehavior('mouseout', this.activatedObj3d);
    }

    this.activatedObj3d = obj3d;

    if (obj3d) {
      this.fireBehavior('mouseover', obj3d);
    }
  }

  private fireBehavior(type: string, target: THREE.Object3D, event?: any) {
    if (!target) return;

    if (target === this.scene) {
      this.modeManager.apply(event2behavior[type], target, event);
      return;
    }
    this.modeManager.apply(event2behavior[`item@${type}`], target, event);
  }

  mount(scene: THREE.Scene, renderer: THREE.Renderer, camera: THREE.Camera): void {
    if (this.mounted) return;

    this.assign({
      scene,
      camera,
      renderer,
      domElement: renderer.domElement,
    });

    for (const [_, list] of this.typedLists) {
      if (list.mounted) continue;
      list.mount(scene);
    }

    const domElement = this.domElement;
    let mousestopTimer = null;

    const mousestop = () => {
      this.isPointerMoving = false;
      mousestopTimer = null;
    };

    this.mousemove = (evt: MouseEvent) => {
      // calculate pointer position in normalized device coordinates
      // (-1 to +1) for both components
      evt.preventDefault();

      this.pointer.x = (evt.clientX / domElement.clientWidth) * 2 - 1;
      this.pointer.y = -(evt.clientY / domElement.clientHeight) * 2 + 1;

      this.isPointerMoving = true;

      clearTimeout(mousestopTimer);
      mousestopTimer = setTimeout(mousestop, 300);

      if (!this.isMouseDown) return;

      this.isMouseMovedAfterDown = true;
    };

    this.mousedown = (mevt: MouseEvent) => {
      this.isMouseDown = true;

      if (this.activatedObj3d) {
        // mousdown
        console.log('obj is down');
        this.fireBehavior('mousedown', this.activatedObj3d);
      }
    };

    this.mouseup = (mevt: MouseEvent) => {
      if (this.activatedObj3d) {
        // mouseup
        console.log('obj is up');
        if (this.isMouseMovedAfterDown) {
          this.cancelClickEventFire();
        }
      } else {
        if (!this.isMouseMovedAfterDown) {
          console.log('noop click');
          this.fireBehavior('click', this.scene, null);
        }
      }

      if (!this.isMouseDown) return;

      this.isMouseDown = false;
      this.isMouseMovedAfterDown = false;
    };

    this.mouseclick = (mevt: MouseEvent) => {
      if (!this.activatedObj3d || this.isClickEventFireCancelled) return;

      this.fireBehavior('click', this.activatedObj3d);
    };

    domElement.addEventListener('mousemove', this.mousemove);
    domElement.addEventListener('mousedown', this.mousedown);
    domElement.addEventListener('mouseup', this.mouseup);
    domElement.addEventListener('click', this.mouseclick);

    // lights, ground
    {
      // lights
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(0, 0, 1);
      scene.add(light);
      const amlight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(amlight);
      // const sky = new THREE.HemisphereLight(0x2345f5, 0xff0000);
      // scene.add(sky);

      const grid = new THREE.GridHelper(5000);
      grid.rotateX(Math.PI / 2);
      scene.add(grid);

      // ground
      const ground = new Ground(5000, 5000);
      scene.add(ground);

      // axes
      const axesHelper = new THREE.AxesHelper(300);
      axesHelper.setColors(
        new THREE.Color(0xffffff), // x
        new THREE.Color(0xff4f00), // y
        new THREE.Color(0x00ff8f), // z
      );
      scene.add(axesHelper);

      // a ref
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(100, 60, 60),
        new THREE.MeshPhongMaterial({ color: 0x00ff99 }),
      );

      ball.position.set(0, 0, 700);
      scene.add(ball);
    }

    // modes
    {
      this.modeManager.create('default', this.injector.$new(DefaultBehavior));
      this.modeManager.mode = 'default';
    }

    writeReadonlyProp(this, 'mounted', true);

    (async () => {
      await this.layout(null);
      writeReadonlyProp(this, 'layouted', true);
    })();
  }

  dispose(): void {
    this.domElement.removeEventListener('mousemove', this.mousemove);
    this.domElement.removeEventListener('mousedown', this.mousedown);
    this.domElement.removeEventListener('mouseup', this.mouseup);
    this.domElement.removeEventListener('click', this.mouseclick);
  }

  queryListAll(): { type: string; value: IList<GraphicObject> }[] {
    throw new Error('Method not implemented.');
  }

  queryList(type: string): IList<GraphicObject> {
    return this.typedLists.get(type);
  }

  addList<O extends THREE.Object3D>(type: string): Object3DList<O> {
    if (this.typedLists.has(type)) return;
    const list = this.injector.$new<Object3DList<O>>(Object3DList);
    this.typedLists.set(type, list);

    this.setEventChild(list);

    if (this.mounted) list.mount(this.scene);

    return list;
  }

  removeList(type: string): void {
    throw new Error('Method not implemented.');
  }

  each(fn: (item: GraphicObject, type: string) => void, type?: string): void {
    throw new Error('Method not implemented.');
  }

  first<M extends GraphicObject>(type: string): M {
    throw new Error('Method not implemented.');
  }

  item(type: string, id: string): GraphicObject {
    throw new Error('Method not implemented.');
  }

  query(type: string, predicate: (item: unknown) => boolean): unknown[] {
    throw new Error('Method not implemented.');
  }

  add<M extends THREE.Object3D = THREE.Object3D>(type: string, item: M): void {
    const list = this.typedLists.get(type);
    if (!list) return;
    list.add(item);

    const that = this as IWarehouse;
    that.onAdd && that.onAdd(item);
  }

  update(type: string, item: GraphicObject, data: any): void {
    throw new Error('Method not implemented.');
  }

  remove(type: string, item: string | GraphicObject): void {
    throw new Error('Method not implemented.');
  }

  injector: IInjector;

  [Symbol.iterator](): Iterator<GraphicObject, any, undefined> {
    throw new Error('Method not implemented.');
  }
}
export interface Warehouse3D extends WithClickCancel {
  onTick(): void;
}
