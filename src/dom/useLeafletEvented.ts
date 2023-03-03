import L from 'leaflet';
import { useEffect } from 'react';
import { useGlobalTick } from './useGlobalTick';

export const useLeafletEvented = <Layer extends L.Layer = L.Layer>(
  evented: Layer,
  events: string,
) => {
  const tick = useGlobalTick();

  useEffect(() => {
    if (!Object.hasOwn(evented, '_leaflet_id')) return;

    evented.on(events, tick);

    return () => {
      evented.off(events, tick);
    };
  }, [evented, events]);
};
