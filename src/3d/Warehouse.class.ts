import THREE from 'three';
import { Constructor, IDisposable } from '@/interfaces';
import { GraphicObject } from '@/interfaces';
import { IInjector } from '@/interfaces';
import { IBehavior, IModeManager } from '@/interfaces';
import { ISelectionManager } from '@/interfaces';
import { ClickCancelMix, WithClickCancel } from '@/model/basic/ClickCancel';
import {
  IWarehouse,
  IWarehouseOptional,
  const$$,
  interfaces,
  Core,
  IList,
  inject,
  deco$$,
  util$$,
} from '@/model';
import { tryInvokingOwn } from '@/utils';
import { ObjectDragBehavior, PointerReactBehavior } from './behaviors';
import { DefaultBehavior } from './behaviors/DefaultBehavior.class';
import { Ground } from './Ground.class';
import { Object3DList } from './Object3DList.class';
import { IControl } from './controls';

@deco$$.mixin(ClickCancelMix)
export abstract class Warehouse3D extends Core implements IWarehouse, IDisposable {
  abstract size: number;

  readonly mounted: boolean = false;
  readonly layouted: boolean = false;

  readonly controls: IControl = null;
  readonly scene: THREE.Scene;
  readonly camera: THREE.Camera = null;
  readonly renderer: THREE.Renderer = null;
  readonly injector: IInjector;

  @inject(interfaces.ISelectionManager)
  readonly selectionManager: ISelectionManager;
  @inject(interfaces.IModeManager)
  readonly modeManager: IModeManager;
  readonly typedLists: Map<string, Object3DList<THREE.Object3D>> = new Map();

  abstract layout(data?: unknown): void | Promise<void>;

  fireBehavior(type: string, target: THREE.Object3D, event?: any) {
    if (!target) return;

    const eventType = const$$.event2behavior[target === this.scene ? type : `item@${type}`];

    this.modeManager.apply(eventType, target, event);
  }

  mount(
    scene: THREE.Scene,
    renderer: THREE.Renderer,
    camera: THREE.Camera,
    controls: IControl,
  ): void {
    if (this.mounted) return;

    this.assign({
      scene,
      camera,
      renderer,
      controls,
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

      // const grid = new THREE.GridHelper(this.radius, 30, 0xffffff, 0xffffff);
      // grid.rotateX(Math.PI / 2);
      // scene.add(grid);

      // ground
      const ground = new Ground({ w: this.size, h: this.size, color: 0x9def89, unlimit: true });
      ground.receiveShadow = true;
      scene.add(ground);

      // axes
      const axesHelper = new THREE.AxesHelper(this.size);

      axesHelper.setColors(
        new THREE.Color(0x3487f0), // x
        new THREE.Color(0xff4f00), // y
        new THREE.Color(0x00ff8f), // z
      );

      console.log(
        '%cX-axis; %cY-axis, %cZ-axis',
        'color: #3487f0',
        'color:#ff4f00',
        'color:#00ff8f',
      );

      scene.add(axesHelper);
    }

    // skybox
    {
      const materialArray = [
        new THREE.MeshBasicMaterial({ color: 0xff9800, side: THREE.BackSide }), // front
        new THREE.MeshBasicMaterial({ color: 0xef8fef, side: THREE.BackSide }), //
        new THREE.MeshBasicMaterial({ color: 0xae10cf, side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ color: 0xea0192, side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ color: 0x13f4aa, side: THREE.BackSide }),
        // new THREE.MeshBasicMaterial({ color: 0x19acef, side: THREE.BackSide }),
      ];

      const skyboxGeo = new THREE.BoxGeometry(this.size, this.size, this.size);
      const skybox = new THREE.Mesh(skyboxGeo, materialArray);
      skybox.translateZ(this.size / 2 - 100);

      this.scene.add(skybox);
    }

    // modes
    {
      this.modeManager.create(
        'default',
        this.injector.$new(PointerReactBehavior, this),
        this.injector.$new(DefaultBehavior),
      );

      this.modeManager.create(
        'drag',
        this.injector.$new(PointerReactBehavior, this),
        this.injector.$new(ObjectDragBehavior, this),
      );

      this.modeManager.create('readonly');

      this.modeManager.mode = 'readonly';
    }

    util$$.writeReadonlyProp(this, 'mounted', true);
    tryInvokingOwn(this, 'onMounted');

    (async () => {
      const data = await this.getLayoutData();
      await this.layout(data);

      util$$.writeReadonlyProp(this, 'layouted', true);
      tryInvokingOwn(this, 'onLayouted');
    })();
  }

  unmount(): void {}

  dispose(): void {}

  queryListAll(): { type: string; value: IList<GraphicObject> }[] {
    throw new Error('Method not implemented.');
  }

  queryList(type: string): IList<GraphicObject> {
    return this.typedLists.get(type);
  }

  regList<O extends THREE.Object3D>(type: string) {
    if (this.typedLists.has(type)) return;
    const list = this.injector.$new(Object3DList<O>);
    this.typedLists.set(type, list);

    this.setEventChild(list);

    if (this.mounted) list.mount(this.scene);

    return list;
  }

  unregList(type: string): void {
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

  create<C extends Constructor<object>>(
    ctor: C,
    ...args: ConstructorParameters<C>
  ): InstanceType<C> {
    return this.injector.$new(ctor, ...args) as InstanceType<C>;
  }

  [Symbol.iterator](): Iterator<THREE.Object3D, any, undefined> {
    throw new Error('Method not implemented.');
  }
}
export interface Warehouse3D extends WithClickCancel, IWarehouseOptional {
  onTick(): void;
}
