import { IInjector } from '@/interfaces/Injector';
import { rootInjector } from '@/model';
import React, { useState } from 'react';
import { MultipleSelectShell, SelectShell } from './Select';

interface Props {
  switch?: boolean;
  defaultKeys?: string[];
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

  const [activatedItems, setActivatedItems] = useState(props.defaultKeys);

  const wkeys = React.Children.map(props.children, (c) => c.key) as unknown as string[];

  return (
    <__world_context__.Provider value={value}>
      <div className="wik wik-world">
        {props.switch && (
          <Switch value={activatedItems} items={wkeys} onSwitch={setActivatedItems} />
        )}
        {React.Children.map(props.children, (child) => {
          if (child.type === SelectShell || child.type === MultipleSelectShell) {
            return child;
          }

          if (!activatedItems.includes(child.key as string)) return null;

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
  value: string[];
  onSwitch: (k: string[]) => void;
}

const Switch = (props: SwitchProps) => {
  const { items, onSwitch, value } = props;

  return (
    <div className="wik-world-switch">
      {items.map((k) => {
        const index = value.indexOf(k);
        const disabled = index === -1;

        return (
          <button
            className={`wik-world-switch-btn${disabled ? ' disabled' : ''}`}
            key={k}
            onClick={() => {
              if (disabled) {
                onSwitch([...value, k]);
              } else {
                value.splice(index, 1);
                onSwitch([...value]);
              }
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
