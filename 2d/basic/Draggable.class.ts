import L from 'leaflet';

export class HrDraggable extends L.Draggable {
  layer: L.Layer;

  constructor(element: HTMLElement, layer: L.Layer) {
    super(element);
    this.layer = layer;
  }

  moved() {
    return (this as any)._moved;
  }

  enabled() {
    return (this as any)._enabled;
  }
}
