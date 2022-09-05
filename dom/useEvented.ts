import EventEmitter from 'eventemitter3';
import { useEffect } from 'react';
import { useGlobalTick } from './useGlobalTick';

export const useEvented = (evented: EventEmitter, events: string) => {
  const tick = useGlobalTick();

  useEffect(() => {
    const eventsArr = events.split(/[\s,]/g);

    for (const event of eventsArr) {
      evented.on(event, tick);
    }

    return () => {
      for (const event of eventsArr) {
        evented.off(event, tick);
      }
    };
  }, [evented, events]);
};
