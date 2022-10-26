import { Renderer } from 'leaflet';
import { EventEmitterStatic3 } from 'eventemitter3';
// import { HrMap } from './2d/basic';

declare global {
  const __PROD__: boolean;
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
