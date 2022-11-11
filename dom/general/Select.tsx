import React, { memo, useMemo } from 'react';
import { AbstractConstructor } from '../../interfaces/Constructor';
import { ReactiveLayer } from '../../mixins/ReactiveLayer';
import { IWarehouse } from '../../model/IWarehouse';
import { LayerPosition } from '../LayerPosition';
import { useEvented } from '../useEvented';
import { useMultipleSelection, useSelection } from '../useSelection';

type CSSWidthHeight = number | string;

export interface SelectShellProps {
  w?: CSSWidthHeight;
  children?: JSX.Element | JSX.Element[];
}

const SelectShell = memo((props: SelectShellProps) => {
  const css = useMemo<React.CSSProperties>(() => {
    return {
      width: props.w,
    };
  }, [props.w]);

  const layer = useSelection() as ReactiveLayer;

  const children = layer ? (
    React.Children.map(props.children, (child) => {
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
    }).filter(Boolean)
  ) : (
    <div>no item.</div>
  );

  return (
    <div style={css} className="wik-select">
      {children}
    </div>
  );
});

interface MultipleSelectShellProps {
  w?: CSSWidthHeight;
  children?: JSX.Element | JSX.Element[];
}

const MultipleSelectShell = memo((props: MultipleSelectShellProps) => {
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
    <div style={css} className="wik-multi-select">
      {children}
    </div>
  );
});

const Modes = memo((props: { warehouse: IWarehouse }) => {
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
    <div style={css} className="wik-modes">
      {entries.map(([name]) => {
        const isThis = name === mode;

        return (
          <div key={name} className={`wik-mode wik-mode--${isThis ? 'active' : 'normal'}`}>
            <a itemID={name} onClick={onModeChange}>
              {name}
            </a>
          </div>
        );
      })}
    </div>
  );
});

export type ObjectSelectProps<M = any, P = {}> = {
  model?: M;
  C?: AbstractConstructor;
  position?: JSX.Element;
} & P;

export type MultipleObjectsSelectProps<M, P = {}> = {
  model?: M[];
  groups?: Record<string, ReactiveLayer[]>;
} & P;

export { Modes, SelectShell, MultipleSelectShell };
