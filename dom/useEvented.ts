import { useEffect } from 'react';
import { useGlobalTick } from './useGlobalTick';

/**
 * @todo Type it.
 */
export const useEvented = (evented: any, events: string) => {
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
