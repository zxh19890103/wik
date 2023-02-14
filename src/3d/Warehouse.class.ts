import THREE, { InstancedMesh } from 'three';
import { IDisposable } from '@/interfaces/Disposable';
import { GraphicObject } from '@/interfaces/GraghicObject';
import { IInjector } from '@/interfaces/Injector';
import { IBehavior, IModeManager } from '@/interfaces/Mode';
import { ISelectionManager } from '@/interfaces/Selection';
import Interface from '@/model/symbols';
import { ClickCancelMix, WithClickCancel } from '../mixins/ClickCancel';
import { IWarehouse, IWarehouseOptional } from '@/model';
import { Core, IList, inject, mixin, writeReadonlyProp } from '@/model/basic';
import { event2behavior } from '@/model/state';
import { tryInvokingOwn } from '@/utils';
import { PointerReactBehavior } from './behaviors';
import { DefaultBehavior } from './behaviors/DefaultBehavior.class';
import { Ground } from './Ground.class';
import { Object3DList } from './Object3DList.class';

@mixin(ClickCancelMix)
export abstract class Warehouse3D extends Core implements IWarehouse, IDisposable {
  readonly mounted: boolean = false;
  readonly layouted: boolean = false;

  readonly scene: THREE.Scene;
  readonly camera: THREE.Camera = null;
  readonly renderer: THREE.Renderer = null;

  @inject(Interface.ISelectionManager)
  readonly selectionManager: ISelectionManager;
  @inject(Interface.IModeManager)
  readonly modeManager: IModeManager;
  readonly typedLists: Map<string, Object3DList<THREE.Object3D>> = new Map();

  abstract layout(data?: unknown): void | Promise<void>;

  fireBehavior(type: string, target: THREE.Object3D, event?: any) {
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
    });

    for (const [_, list] of this.typedLists) {
      if (list.mounted) continue;
      list.mount(scene);
    }
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
        new THREE.Color(0x3487f0), // x
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
      this.modeManager.create(
        'default',
        this.injector.$new(PointerReactBehavior, this),
        this.injector.$new(DefaultBehavior),
      );

      this.modeManager.create('readonly');

      this.modeManager.mode = 'readonly';
    }

    writeReadonlyProp(this, 'mounted', true);
    tryInvokingOwn(this, 'onMounted');

    (async () => {
      const data = await this.getLayoutData();
      await this.layout(data);

      writeReadonlyProp(this, 'layouted', true);
      tryInvokingOwn(this, 'onLayouted');
    })();
  }

  dispose(): void {}

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
    const list = this.typedLists.get(type);
    if (!list) return;

    this.typedLists.delete(type);

    list.setEventParent(null);

    if (list.mounted) list.unmount();
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

    this.onAdd && this.onAdd(item);
  }

  update(type: string, item: THREE.Object3D, data: any): void {
    throw new Error('Method not implemented.');
  }

  remove(type: string, item: string | THREE.Object3D): void {
    const list = this.typedLists.get(type);
    if (!list) return;

    if (typeof item === 'string') {
      list.removeById(item);
    } else {
      list.remove(item);
    }
  }

  /**
   * retains the data for layouting ,which is the initial data. default is null, you can overrides it in subclass.
   */
  getLayoutData(): Promise<any> {
    return Promise.resolve(null);
  }

  /**
   * default is empty, you can overrides it.
   */
  configModes(): Record<string, IBehavior[]> {
    return {};
  }

  injector: IInjector;

  [Symbol.iterator](): Iterator<THREE.Object3D, any, undefined> {
    throw new Error('Method not implemented.');
  }
}
export interface Warehouse3D extends WithClickCancel, IWarehouseOptional {
  onTick(): void;
}
