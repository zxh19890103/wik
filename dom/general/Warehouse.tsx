import React, { useContext, useEffect, useRef, useState } from 'react';
import THREE from 'three';
import { HrMap } from '../../2d/basic';
import { ArcballControls } from '../../3d/controls';
import { IInjector } from '../../interfaces/Injector';
import { IWarehouse } from '../../model';
import { Model, View } from '../../model/basic';
import { __world_context__ } from './World';

type WarehouseProvider = IWarehouse | ((injector: IInjector) => IWarehouse);

type WarehouseContextValue = {
  warehouse: IWarehouse;
  mvMappings: Record<string, (m: Model, warehouse: IWarehouse) => View>;
};

interface Props {
  model: WarehouseProvider;
  mvMappings?: Record<string, (m: any) => any>;
  children?: JSX.Element | JSX.Element[];
}

const whStyle = { width: '100%', height: '100%' };

export const __warehouse_context__ = React.createContext<WarehouseContextValue>({
  warehouse: null,
  mvMappings: null,
});

const Warehouse = (props: Props) => {
  const element = useRef<HTMLDivElement>();

  const [value, setValue] = useState<WarehouseContextValue>(() => {
    return {
      warehouse: null,
      mvMappings: props.mvMappings,
    };
  });

  const { injector } = useContext(__world_context__);

  useEffect(() => {
    const root = new HrMap(element.current);
    const warehouse = createWarehouse(injector, props.model);
    warehouse?.mount(root);
    setValue({ ...value, warehouse });
  }, []);

  return (
    <__warehouse_context__.Provider value={value}>
      <div style={whStyle} className="wik-warehouse" ref={element}>
        {value?.warehouse &&
          React.Children.map(props.children, (child) => {
            return <child.type {...child.props} parent={value.warehouse} />;
          })}
      </div>
    </__warehouse_context__.Provider>
  );
};

const Warehouse3D = (props: Props) => {
  const elementRef = useRef<HTMLDivElement>();
  const [value, setValue] = useState<WarehouseContextValue>(null);
  const { injector } = useContext(__world_context__);

  useEffect(() => {
    const element = elementRef.current;

    const w = element.clientWidth,
      h = element.clientHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 1);
    renderer.clear();

    element.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, w / h, 1, Number.MAX_SAFE_INTEGER);
    camera.position.set(3000, 5000, 1000);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();

    // lights
    {
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(0, 0, 1);
      scene.add(light);
      const amlight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(amlight);
      // const sky = new THREE.HemisphereLight(0x2345f5, 0xff0000);
      // scene.add(sky);
    }

    // ground
    {
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(5000, 5000, 500, 500),
        new THREE.MeshPhongMaterial({ color: 0x666666 }),
      );

      ground.position.set(0, 0, 0);
      scene.add(ground);
    }

    // a ref
    {
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(100, 60, 60),
        new THREE.MeshPhongMaterial({ color: 0x00ff99 }),
      );

      ball.position.set(0, 0, 700);
      scene.add(ball);
    }

    const control = new ArcballControls(camera, renderer.domElement, scene);
    control.update();

    const loop = () => {
      requestAnimationFrame(loop);
      renderer.render(scene, camera);
    };

    setTimeout(loop, 0);

    const warehouse = createWarehouse(injector, props.model);
    warehouse?.mount(scene);

    setValue({ ...value, mvMappings: props.mvMappings, warehouse });
  }, []);

  return (
    <__warehouse_context__.Provider value={value}>
      <div style={whStyle} className="wik-warehouse" ref={elementRef}>
        {value?.warehouse &&
          React.Children.map(props.children, (child) => {
            return <child.type {...child.props} parent={value.warehouse} />;
          })}
      </div>
    </__warehouse_context__.Provider>
  );
};

export { Warehouse, Warehouse3D };

const createWarehouse = (injector: IInjector, model: WarehouseProvider) => {
  if (typeof model === 'function') {
    return model(injector);
  } else {
    return model;
  }
};
