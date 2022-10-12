import { Renderer } from 'leaflet';
import { EventEmitterStatic3 } from 'eventemitter3';
import { HrMap } from './2d/basic';

declare global {
  const __PROD__: boolean;
  const EventEmitter3: EventEmitterStatic3;
}

declare module 'leaflet' {
  interface Renderer {
    _container: HTMLCanvasElement;
    _map: HrMap;
    _onMouseMove(e): void;
    _handleMouseOut(e): void;
    _onClick(e): void;
  }

  interface Layer {
    _mapToAdd: HrMap;
  }

  interface Canvas {
    _ctx: CanvasRenderingContext2D;
    _updatePoly(...args): any;
  }

  interface Popup {
    _element: HTMLDivElement;
  }

  interface LatLngBounds {
    /**
     * the left-bottom position
     */
    _southWest: L.LatLng;
    /**
     * the right-top position
     */
    _northEast: L.LatLng;
  }
}

declare module 'eventemitter3' {
  export interface EventEmitterStatic3 {
    new <EventTypes extends ValidEventTypes = string | symbol, Context = any>(): Omit<
      EventEmitter<EventTypes, Context>,
      'emit' | 'on' | 'off' | 'once'
    >;
  }

  /**
   * We cannot append export EventEmitter3 in the module.
   * So define it on the globalThis
   */
  // const EventEmitter3: EventEmitterStatic3;
}
