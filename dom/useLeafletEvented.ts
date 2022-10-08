import { useEffect } from 'react';
import { useGlobalTick } from './useGlobalTick';

export const useLeafletEvented = (evented: any, events: string) => {
  const tick = useGlobalTick();

  useEffect(() => {
    evented.on(events, tick);
    return () => {
      evented.off(events, tick);
    };
  }, [evented, events]);
};
