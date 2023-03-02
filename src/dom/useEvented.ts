import { WithEmitter } from '@/model/basic/Emitter';
import { useEffect } from 'react';
import { useGlobalTick } from './useGlobalTick';

export function useEvented<E extends string>(evented: WithEmitter<E>, events: E): void;
export function useEvented<E extends string>(evented: WithEmitter<E>, events: string) {
  const tick = useGlobalTick();

  useEffect(() => {
    const eventsArr = events.split(/[\s,]/g).filter(Boolean);

    for (const event of eventsArr) {
      evented.listen$n(event, tick);
    }

    return () => {
      for (const event of eventsArr) {
        evented.unlisten$n(event, tick);
      }
    };
  }, [evented, events]);
}
