import React, { useContext, useEffect, useRef, useState } from 'react';
import THREE from 'three';
import { HrMap } from '../../2d/basic';
import { OrbitControls } from '../../3d/controls';
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

    const w = element.clientWidth;
    const h = element.clientHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 1);
    renderer.clear();

    element.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, w / h, 1, Number.MAX_SAFE_INTEGER);
    camera.position.set(5000, 0, 1000);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();

    let warehouse: IWarehouse = null;

    const adjust = () => {
      const w = element.clientWidth;
      const h = element.clientHeight;

      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    // const control = new ArcballControls(camera, renderer.domElement, scene);
    // control.update();
    new OrbitControls(camera, renderer.domElement);

    const loop = () => {
      requestAnimationFrame(loop);

      if (warehouse) {
        const w = warehouse as any;
        w.raycaster.setFromCamera(w.pointer, camera);
        w.tick();
      }

      renderer.render(scene, camera);
    };

    const $nextTick = (fn: () => void) => {};

    setTimeout(loop, 0);

    window.onresize = adjust;

    warehouse = createWarehouse(injector, props.model);
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
