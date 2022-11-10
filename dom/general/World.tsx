import { IInjector } from '../../interfaces/Injector';
import { rootInjector } from '../../model/basic';
import React, { useMemo, useState } from 'react';

interface Props {
  switch?: boolean;
  defaultKey?: string;
  children?: JSX.Element | JSX.Element[];
}

type ContextValue = {
  injector: IInjector;
};

export const __world_context__ = React.createContext<ContextValue>({ injector: null });

const World = (props: Props) => {
  const [value] = useState<ContextValue>(() => {
    return {
      injector: rootInjector,
    };
  });

  const style = useMemo<React.CSSProperties>(() => {
    return {
      display: 'flex',
      flexDirection: 'row',
      width: '100vw',
      height: '100vh',
    };
  }, []);

  const itemStyle = useMemo<React.CSSProperties>(() => {
    return {
      flex: 1,
      boxSizing: 'border-box',
      border: '1px dashed #000',
      height: '100%',
    };
  }, []);

  const [curr, setCurr] = useState(props.defaultKey);

  const wkeys = React.Children.map(props.children, (c) => c.key) as unknown as string[];

  return (
    <__world_context__.Provider value={value}>
      <div className="wik wik-world" style={style}>
        {props.switch && <Switch items={wkeys} onSwitch={setCurr} />}
        {React.Children.map(props.children, (child) => {
          if (curr !== child.key) return null;

          return (
            <div key={child.key} style={itemStyle} className="wik-world__nation">
              {child}
            </div>
          );
        })}
      </div>
    </__world_context__.Provider>
  );
};

const Switch = (props: { items: string[]; onSwitch: (k: string) => void }) => {
  return (
    <div className="wik-world__switch" style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
      {props.items.map((k) => {
        return (
          <button
            onClick={() => {
              props.onSwitch(k);
            }}
          >
            {k}
          </button>
        );
      })}
    </div>
  );
};

export { World };
