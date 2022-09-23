import { useEffect, useRef } from 'react';
import { HrMap } from '../2d/basic';
import { IWarehouse } from '../model';

import './Scene.scss';

interface SceneProps {
  warehouse: IWarehouse;
  bgColor?: string;
  afterMount: (root: HrMap) => void;
}

export const Scene = (props: SceneProps) => {
  const element = useRef<HTMLDivElement>(null);

  const { warehouse } = props;

  useEffect(() => {
    const root = new HrMap(element.current);
    warehouse.mount(root);

    props.afterMount && props.afterMount(root);

    if (props.bgColor) {
      element.current.style.background = props.bgColor;
    }
  }, [warehouse]);

  return <div className="hrScene" ref={element} />;
};
