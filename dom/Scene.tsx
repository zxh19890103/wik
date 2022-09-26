import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { WarehousePhase } from '../2d';
import { HrMap } from '../2d/basic';
import { IWarehouse } from '../model';

import './Scene.scss';
import { SelectionContext } from './useSelection';

type CSSWidthHeight = number | string;

interface SceneProps {
  warehouse: IWarehouse;
  flex?: CSSWidthHeight;
  w?: CSSWidthHeight;
  h?: CSSWidthHeight;
  border?: boolean;
  onPhase?: (phase: WarehousePhase) => void;
}

export const Scene = (props: SceneProps) => {
  const element = useRef<HTMLDivElement>(null);

  const { warehouse, onPhase } = props;

  useEffect(() => {
    const root = new HrMap(element.current);
    warehouse.mount(root);

    return () => {};
  }, [warehouse]);

  useEffect(() => {
    const div = element.current;
    let phase: number = null;

    const onPhaseChange = (evt) => {
      if (phase !== null) {
        div.classList.remove(`hrScene-phase--${WarehousePhase[phase]}`);
      }

      phase = evt.payload.phase;
      div.classList.add(`hrScene-phase--${WarehousePhase[phase]}`);

      onPhase && onPhase(phase);
    };

    (warehouse as any).on('phase', onPhaseChange);

    return () => {
      (warehouse as any).off('phase', onPhaseChange);
    };
  }, [warehouse, onPhase]);

  const css = useMemo<React.CSSProperties>(() => {
    return {
      width: props.w,
      height: props.h,
      flex: props.flex,
      border: props.border ? '1px solid #ddd' : null,
    };
  }, [props.w, props.h, props.flex]);

  return (
    <div style={css} className="hrScene" ref={element}>
      <SelectionContext warehouse={warehouse} />
    </div>
  );
};

Scene.Layout = memo(
  (
    props: React.PropsWithChildren<{
      flow: 'horizontal' | 'vertical';
      w?: CSSWidthHeight;
      h?: CSSWidthHeight;
    }>,
  ) => {
    const css = useMemo<React.CSSProperties>(() => {
      return {
        flexDirection: props.flow === 'vertical' ? 'column' : 'row',
        width: props.w,
        height: props.h,
      };
    }, [props.flow, props.w, props.h]);

    return (
      <div style={css} className="hrSceneFlex">
        {props.children}
      </div>
    );
  },
);

Scene.Detail = memo((props: React.PropsWithChildren<{ w?: CSSWidthHeight }>) => {
  const css = useMemo<React.CSSProperties>(() => {
    return {
      width: props.w,
    };
  }, [props.w]);

  return (
    <div style={css} className="hrSceneDetail">
      {props.children}
    </div>
  );
});
