import { IInjector } from '@/interfaces';
import * as meta from '@/model/meta';
import { useEffect, useState } from 'react';

import { wik, wikdom, wikui } from '@/i3d';

wik.configProviders('root', {
  [wik.interfaces.IGlobalConstManager]: wik.GlobalConstManager,
  [wik.interfaces.ILogger]: { useFactory: () => console },
});

@wik.inject(wik.interfaces.IInjector)
@wik.provides({
  [wik.interfaces.IModeManager]: wik.ModeManager,
})
class MyWarehouse3D extends wikui.Warehouse3D {
  size = 100000000;

  constructor(injector: IInjector) {
    super();

    this.assign('injector', injector);
  }

  async layout(data: any) {
    // this.scene.add(this.instancedBoard);
    // const manager = new THREE.LoadingManager();
    // const loader = new GLTFLoader(manager) as any;
    // loader.load('/desk.glb', (gltf) => {
    //   const model = gltf.scene;
    //   console.log(model);
    //   // model.rotateX(90);
    //   model.scale.set(100, 100, 100);
    //   const material = new THREE.MeshPhongMaterial({ color: 0xff9100 });
    //   model.traverse((o) => {
    //     if (o.isMesh) o.material = material;
    //   });
    //   this.scene.add(model);
    // });
    // this.robots.add(new MyRobot());
  }
}

export default () => {
  const [state] = useState(() => {
    return {
      dots: new wik.List(wik.Point, []),
    };
  });

  useEffect(() => {
    setTimeout(() => {
      wik.__batched_fires__(() => {
        // 400 dots
        for (let x = 0; x < 3; x++) {
          for (let y = 0; y < 3; y++) {
            const dot = state.dots.create();
            dot.px = x * 2000;
            dot.py = y * 2000;
            dot.pz = 0;
          }
        }
      }, 'size');
    }, 500);
  }, []);

  return (
    <wikdom.World defaultKeys={['w3d']}>
      <wikdom.Warehouse3D key="w3d" modes mvMappings={mvMapping3} warehouse={MyWarehouse3D}>
        <wikdom.ViewSet3D type="rack" model={state.dots} />
      </wikdom.Warehouse3D>
      <wikdom.SelectShell w={300}>
        <Aside />
      </wikdom.SelectShell>
    </wikdom.World>
  );
};

const Aside = (props: wikdom.ObjectSelectProps<wik.View>) => {
  return (
    <div>
      got one # {props.C?.name} // {props.model?.id}
      <pre>{JSON.stringify(props.model.model, null, 2)}</pre>
      <hr />
      {props.children}
    </div>
  );
};

const rackSpec: meta.Rack = {
  type: 'General',
  width: 1600,
  depth: 500,
  height: 3400,
  heightPerLayer: 360,
  distanceOffGround: 20,
};

class RackView extends wikui.Rack implements wik.PointView, wik.WithWarehouseRef<MyWarehouse3D> {
  model: wik.Point;
  $$warehouse: MyWarehouse3D;

  constructor(m: wik.Point) {
    super({ x: m.px, y: m.py, z: m.pz }, rackSpec);
  }

  whenInit(): void {}
  whenUnInit?(): void {}
  whenEffect?(effect: string): void {}
}

const mvMapping3 = {
  rack: (m: wik.Point, w: MyWarehouse3D) => {
    return new RackView(m);
  },
};
