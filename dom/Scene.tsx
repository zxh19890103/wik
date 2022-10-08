import React, { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { WarehousePhase } from '../2d';
import { HrMap } from '../2d/basic';
import { AbstractConstructor, Constructor } from '../interfaces/Constructor';
import { ReactiveLayer } from '../mixins/ReactiveLayer';
import { IWarehouse } from '../model';
import { LayerPosition } from './LayerPosition';

import './Scene.scss';
import { useEvented } from './useEvented';
import { SelectionContext, useMultipleSelection, useSelection } from './useSelection';

type CSSWidthHeight = number | string;

interface SceneProps {
  warehouse: IWarehouse;
  flex?: CSSWidthHeight;
  w?: CSSWidthHeight;
  h?: CSSWidthHeight;
  border?: boolean;
  children?: JSX.Element;
  /**
   * If display modes list
   */
  modes?: boolean;
  view?: [number, number, number];
  onPhase?: (phase: WarehousePhase) => void;
}

export const Scene = (props: SceneProps) => {
  const element = useRef<HTMLDivElement>(null);

  const { warehouse, onPhase, children: child } = props;
  const [root, setRoot] = useState<HrMap>(null);

  useEffect(() => {
    const root = new HrMap(element.current);

    warehouse.mount(root);
    setRoot(root);

    return () => {};
  }, [warehouse]);

  useEffect(() => {
    if (!props.view) return;
    const [lat, lng, zoom] = props.view;
    if (lat !== undefined && lng !== undefined) {
      root?.setView([lat, lng], zoom ?? 1);
    } else if (zoom !== undefined) {
      root?.setZoom(zoom);
    }
  }, [root, props.view]);

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
      {props.modes && <Scene.Modes warehouse={warehouse} />}
      {child && root && <child.type {...child.props} warehouse={warehouse} map={root} />}
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

interface DetailShellProps {
  w?: CSSWidthHeight;
  children?: JSX.Element | JSX.Element[];
}

export type LayerSelectProps<P = {}> = {
  model?: ReactiveLayer;
  C?: AbstractConstructor;
  position?: JSX.Element;
} & P;

Scene.SelectShell = memo((props: DetailShellProps) => {
  const css = useMemo<React.CSSProperties>(() => {
    return {
      width: props.w,
    };
  }, [props.w]);

  const layer = useSelection() as ReactiveLayer;

  const children = React.Children.map(props.children, (child) => {
    if (!child.props.C || layer instanceof child.props.C) {
      return (
        <child.type
          {...child.props}
          key={child.key}
          position={<LayerPosition model={layer} />}
          model={layer}
        />
      );
    } else {
      return null;
    }
  }).filter(Boolean);

  return (
    <div style={css} className="hrSceneDetail">
      {children}
    </div>
  );
});

interface MultipleSelectProps {
  w?: CSSWidthHeight;
  children?: JSX.Element | JSX.Element[];
}

export type LayerMultipleSelectProps<P = {}> = {
  model?: ReactiveLayer[];
  groups?: Record<string, ReactiveLayer[]>;
} & P;

Scene.MultipleSelectShell = memo((props: MultipleSelectProps) => {
  const css = useMemo<React.CSSProperties>(() => {
    return {
      width: props.w,
    };
  }, [props.w]);

  const items = useMultipleSelection() as ReactiveLayer[];

  const children = React.Children.map(props.children, (child) => {
    return <child.type {...child.props} key={child.key} groups={null} model={items} />;
  }).filter(Boolean);

  return (
    <div style={css} className="hrSceneDetail">
      {children}
    </div>
  );
});

Scene.Modes = memo((props: { warehouse: IWarehouse }) => {
  const css = useMemo<React.CSSProperties>(() => {
    return {};
  }, []);

  const { warehouse } = props;
  const { modeManager } = warehouse;

  useEvented(modeManager, 'change');

  const onModeChange = (evt) => {
    const name = evt.target.getAttribute('itemid');
    if (mode === name) return;
    console.log(name);
    modeManager.mode = name;
  };

  const mode = modeManager.mode?.name;
  const entries = [...modeManager.modes];

  return (
    <div style={css} className="hrSceneModes">
      {entries.map(([name]) => {
        const isThis = name === mode;

        return (
          <div key={name} className={`hrSceneMode hrSceneMode--${isThis ? 'active' : 'normal'}`}>
            <a itemID={name} onClick={onModeChange}>
              {name}
            </a>
          </div>
        );
      })}
    </div>
  );
});
