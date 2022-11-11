import { IInjector } from '../../interfaces/Injector';
import { rootInjector } from '../../model/basic';
import React, { useMemo, useState } from 'react';
import { MultipleSelectShell, SelectShell } from './Select';

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

  const [curr, setCurr] = useState(props.defaultKey);

  const wkeys = React.Children.map(props.children, (c) => c.key) as unknown as string[];

  return (
    <__world_context__.Provider value={value}>
      <div className="wik wik-world">
        {props.switch && <Switch items={wkeys} onSwitch={setCurr} />}
        {React.Children.map(props.children, (child) => {
          if (child.type === SelectShell || child.type === MultipleSelectShell) {
            return child;
          }

          if (curr !== child.key) return null;

          return (
            <div key={child.key} className="wik-world-item">
              {child}
            </div>
          );
        })}
      </div>
    </__world_context__.Provider>
  );
};

interface SwitchProps {
  items: string[];
  onSwitch: (k: string) => void;
}

const Switch = (props: SwitchProps) => {
  return (
    <div className="wik-world-switch" style={{}}>
      {props.items.map((k) => {
        return (
          <button
            key={k}
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
