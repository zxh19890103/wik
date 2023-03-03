import { WithEmitter } from '@/model/basic/Emitter';
import { useEffect } from 'react';
import { useGlobalTick } from './useGlobalTick';

export function useEvented<E extends string>(evented: WithEmitter<E>, events: E): void;
export function useEvented<E extends string>(evented: WithEmitter<E>, events: string) {
  const tick = useGlobalTick();

  useEffect(() => {
    if (!evented.$$isEmitter) return;

    const _events = Array.isArray(events) ? events.join(' ') : events;

    evented.listen$n(_events, tick);
    return () => {
      evented.unlisten$n(_events, tick);
    };
  }, [evented, events]);
}
