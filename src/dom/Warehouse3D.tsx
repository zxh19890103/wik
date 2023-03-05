import React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import THREE from 'three';
import { OrbitControls, MapControls } from '@/3d/controls';
import { IWarehouse } from '@/model';
import { WarehouseContextValue, WarehouseProps } from './interface';
import { Modes } from './Select';
import { SelectionContext } from './useSelection';
import {
  createWarehouse,
  whStyle,
  __context_value__,
  __warehouse_context__,
} from './WarehouseContext';
import { __world_context__ } from './World';

export const Warehouse3D = (props: WarehouseProps) => {
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
    camera.position.set(1, 10000, 5000);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const adjustSize = () => {
      const w = element.clientWidth;
      const h = element.clientHeight;

      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    adjustSize();

    const scene = new THREE.Scene();

    let warehouse: IWarehouse = null;

    const controls = new OrbitControls(camera, renderer.domElement);

    const loop = () => {
      requestAnimationFrame(loop);

      if (warehouse) {
        warehouse.onTick && warehouse.onTick();
      }

      renderer.render(scene, camera);
    };

    setTimeout(loop, 0);

    window.onresize = adjustSize;

    warehouse = createWarehouse(injector, props.warehouse);
    warehouse?.mount(scene, renderer, camera, controls);

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
