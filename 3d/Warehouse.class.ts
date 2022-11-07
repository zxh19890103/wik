import THREE, { InstancedMesh, Mesh } from 'three';
import { IDisposable } from '../interfaces/Disposable';
import { GraphicObject } from '../interfaces/GraghicObject';
import { IInjector } from '../interfaces/Injector';
import { IModeManager } from '../interfaces/Mode';
import { ISelectionManager } from '../interfaces/Selection';
import Interface from '../interfaces/symbols';
import { IWarehouse } from '../model';
import { Core, IList, inject, writeReadonlyProp } from '../model/basic';
import { Ground } from './Ground.class';
import { Object3DList } from './Object3DList.class';

export abstract class Warehouse3D extends Core implements IWarehouse, IDisposable {
  readonly mounted: boolean = false;
  readonly layouted: boolean = false;
  readonly raycaster: THREE.Raycaster = null;
  readonly pointer: THREE.Vector2 = null;

  protected readonly scene: THREE.Scene;

  @inject(Interface.ISelectionManager)
  readonly selectionManager: ISelectionManager;
  @inject(Interface.IModeManager)
  readonly modeManager: IModeManager;
  readonly typedLists: Map<string, Object3DList<THREE.Object3D>> = new Map();

  private mousemove: (event: PointerEvent) => void;
  private mousedown: (event: PointerEvent) => void;
  private mouseup: (event: PointerEvent) => void;

  isMouseDown = false;
  isMouseMovedAfterDown = false;
  isMouseMoving = false;

  activatedObj3d: THREE.Object3D = null;
  instanceId: number = null;
  intersection: THREE.Intersection<THREE.Object3D>;

  constructor() {
    super();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(0, 0);
  }

  abstract layout(data?: unknown): void | Promise<void>;

  tick() {
    if (!this.isMouseMoving) return;

    console.log('moving...');

    let obj3d: THREE.Object3D = null;
    let instid: number = null;

    this.intersection = null;

    for (const obj of this.scene.children) {
      if (!(obj as any).isInteractive) continue;

      if ((obj as InstancedMesh).isInstancedMesh) {
        const mesh = obj as InstancedMesh;
        const intersection = this.raycaster.intersectObject(mesh);
        if (intersection.length === 0) continue;

        obj3d = mesh;
        this.intersection = intersection[0];
        instid = this.intersection.instanceId;
        break;
      } else if ((obj as Mesh).isMesh) {
        const mesh = obj as Mesh;
        const intersection = this.raycaster.intersectObject(mesh);
        if (intersection.length === 0) continue;

        this.intersection = intersection[0];
        obj3d = this.intersection.object;
        instid = null;
        break;
      } else {
        // ignore
      }
    }

    if (this.activatedObj3d === obj3d) {
      if (this.instanceId !== instid) {
        console.log('inst changed');
        // mouseout mouseover
        this.instanceId = instid;
      }
    } else {
      console.log('obj changed');
      // mouseout mouseover
      this.activatedObj3d = obj3d;
      this.instanceId = instid;
    }
  }

  mount(scene: THREE.Scene): void {
    if (this.mounted) return;

    writeReadonlyProp(this, 'scene', scene);
    writeReadonlyProp(this, 'mounted', true);

    for (const [_, list] of this.typedLists) {
      if (list.mounted) continue;
      list.mount(scene);
    }

    let mousestopTimer = null;

    const mousestop = () => {
      this.isMouseMoving = false;
      mousestopTimer = null;
    };

    this.mousemove = (event: PointerEvent) => {
      // calculate pointer position in normalized device coordinates
      // (-1 to +1) for both components
      event.preventDefault();

      this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.isMouseMoving = true;

      clearTimeout(mousestopTimer);
      mousestopTimer = setTimeout(mousestop, 300);

      if (!this.isMouseDown) return;

      this.isMouseMovedAfterDown = true;
    };

    this.mousedown = (event: PointerEvent) => {
      this.isMouseDown = true;

      if (this.activatedObj3d) {
        // mousdown
        console.log('obj is down');
      }
    };

    this.mouseup = (event: PointerEvent) => {
      if (this.activatedObj3d) {
        // mouseup
        console.log('obj is up');
        if (!this.isMouseMovedAfterDown) {
          // click
          console.log('clicked at the same time.');
          const obj3d = this.activatedObj3d as any;
          this.modeManager.apply('onClick', obj3d, { instanceId: this.instanceId });
        }
      }

      if (!this.isMouseDown) return;

      this.isMouseDown = false;
      this.isMouseMovedAfterDown = false;
    };

    document.addEventListener('pointermove', this.mousemove);
    document.addEventListener('pointerdown', this.mousedown);
    document.addEventListener('pointerup', this.mouseup);

    {
      // lights
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(0, 0, 1);
      scene.add(light);
      const amlight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(amlight);
      // const sky = new THREE.HemisphereLight(0x2345f5, 0xff0000);
      // scene.add(sky);

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

    (async () => {
      await this.layout(null);
      writeReadonlyProp(this, 'layouted', true);
    })();
  }

  dispose(): void {
    document.removeEventListener('pointermove', this.mousemove);
    document.removeEventListener('pointerdown', this.mousedown);
    document.removeEventListener('pointerup', this.mouseup);
  }

  queryListAll(): { type: string; value: IList<GraphicObject> }[] {
    throw new Error('Method not implemented.');
  }

  queryList(type: string): IList<GraphicObject> {
    throw new Error('Method not implemented.');
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

  add(type: string, item: GraphicObject): void {
    throw new Error('Method not implemented.');
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
