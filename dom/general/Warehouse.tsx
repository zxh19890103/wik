import React, { useContext, useEffect, useRef, useState } from 'react';
import THREE from 'three';
import { HrMap } from '../../2d/basic';
import { OrbitControls } from '../../3d/controls';
import { IInjector } from '../../interfaces/Injector';
import { IWarehouse } from '../../model';
import { SelectionContext } from '../useSelection';
import { Modes } from './Select';
import { __world_context__ } from './World';

export type MvMappings = Record<string, (m: any, warehouse: any) => any>;

type WarehouseProvider = IWarehouse | ((injector: IInjector) => IWarehouse);

type WarehouseContextValue = {
  warehouse: IWarehouse;
  mvMappings: MvMappings;
};

interface Props {
  warehouse: WarehouseProvider;
  mvMappings?: MvMappings;
  children?: JSX.Element | JSX.Element[];
  modes?: boolean;
}

const whStyle = { width: '100%', height: '100%' };

const __context_value__ = Object.freeze({
  warehouse: null,
  mvMappings: null,
});

export const __warehouse_context__ = React.createContext<WarehouseContextValue>(__context_value__);

/**
 * 2d warehouse
 */
const Warehouse = (props: Props) => {
  const element = useRef<HTMLDivElement>();

  const [value, setValue] = useState<WarehouseContextValue>({
    ...__context_value__,
    mvMappings: props.mvMappings,
  });

  const { injector } = useContext(__world_context__);

  useEffect(() => {
    const root = new HrMap(element.current);
    const warehouse = createWarehouse(injector, props.warehouse);
    warehouse?.mount(root);
    setValue({ ...value, warehouse });
  }, []);

  const { warehouse } = value;

  return (
    <__warehouse_context__.Provider value={value}>
      <div style={whStyle} className="wik-warehouse" ref={element}>
        {warehouse && (
          <>
            <SelectionContext warehouse={warehouse} />
            {props.modes && <Modes warehouse={warehouse} />}
            {React.Children.map(props.children, (child) => {
              return <child.type {...child.props} parent={warehouse} />;
            })}
          </>
        )}
      </div>
    </__warehouse_context__.Provider>
  );
};

const Warehouse3D = (props: Props) => {
  const elementRef = useRef<HTMLDivElement>();
  const [value, setValue] = useState<WarehouseContextValue>({
    ...__context_value__,
    mvMappings: props.mvMappings,
  });
  const { injector } = useContext(__world_context__);

  useEffect(() => {
    const element = elementRef.current;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 1);
    renderer.clear();

    element.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, 1, 1, Number.MAX_SAFE_INTEGER);
    camera.position.set(5000, 0, 1000);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const adjust = () => {
      const w = element.clientWidth;
      const h = element.clientHeight;

      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    adjust();

    const scene = new THREE.Scene();

    let warehouse: IWarehouse = null;

    new OrbitControls(camera, renderer.domElement);

    const loop = () => {
      requestAnimationFrame(loop);

      if (warehouse) {
        warehouse.onTick && warehouse.onTick();
      }

      renderer.render(scene, camera);
    };

    setTimeout(loop, 0);

    window.onresize = adjust;

    warehouse = createWarehouse(injector, props.warehouse);
    warehouse?.mount(scene, renderer, camera);

    setValue({ ...value, mvMappings: props.mvMappings, warehouse });
  }, []);

  const { warehouse } = value;

  return (
    <__warehouse_context__.Provider value={value}>
      <div style={whStyle} className="wik-warehouse" ref={elementRef}>
        {warehouse && (
          <>
            <SelectionContext warehouse={warehouse} />
            {props.modes && <Modes warehouse={warehouse} />}
            {React.Children.map(props.children, (child) => {
              return <child.type {...child.props} parent={warehouse} />;
            })}
          </>
        )}
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
