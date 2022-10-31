import { IInjector } from '../../interfaces/Injector';
import { rootInjector } from '../../model/basic';
import React, { useMemo, useState } from 'react';

interface Props {
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

  return (
    <__world_context__.Provider value={value}>
      <div className="wik wik-world" style={style}>
        {React.Children.map(props.children, (child) => {
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

export { World };
