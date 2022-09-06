import L from 'leaflet';
import { GraphicObject } from '../../interfaces/GraghicObject';
import { Interactive } from '../../interfaces/Interactive';
import { ContextMenuItem } from '../../interfaces/types';
import { ReactiveLayer } from '../../mixins/ReactiveLayer';
import { Behavior } from '../../model/behaviors';
import { HrMap } from '../basic';
import { Warehouse } from '../Warehouse.class';

/**
 * @todo
 * marker is not ok.
 */

export class EditBehavior extends Behavior {
  private ogirin: L.Marker = null;
  private currentContextMenuTarget = null;
  private currentContextMenuItems: ContextMenuItem[] = null;
  private contextmenuPopup: L.Popup = null;

  constructor(private warehouse: Warehouse, private map: HrMap) {
    super();
  }

  onLoad(): void {
    console.log('load edit behavior');
    this.ogirin = L.marker([0, 0]).addTo(this.map);

    this.contextmenuPopup = new L.Popup({
      keepInView: true,
      closeButton: false,
      closeOnClick: true,
      className: 'hrContextMenu',
      closeOnEscapeKey: false,
    }).on('remove', () => {
      this.currentContextMenuTarget = null;
      this.currentContextMenuItems = null;
    });
  }

  onUnload(): void {
    this.ogirin?.remove();
    this.ogirin = null;
    console.log('unload edit behavior');
  }

  onClick(obj: GraphicObject): void {
    console.log('clicked');
  }

  onNoopClick(evt: unknown): void {
    console.log('noop clicked');
  }

  private handleContextMenuClick = (e) => {
    const target = e.target as HTMLAnchorElement;
    if (target.tagName !== 'A') return;
    const value = target.getAttribute('data-value');

    if (!value || !value.trim()) {
      if (!__PROD__) {
        console.warn('value should not be empty!');
      }
    } else {
      const item = this.currentContextMenuItems.find((x) => x.value === value);
      if (item && item.callback) {
        if (typeof item.callback === 'string') {
          if (this.currentContextMenuTarget[item.callback]) {
            this.currentContextMenuTarget[item.callback]();
          }
        } else {
          item.callback();
        }
      } else if (this.currentContextMenuTarget.onContextMenuClick) {
        this.currentContextMenuTarget.onContextMenuClick(value);
      }
    }

    this.contextmenuPopup.remove();
  };

  override onContextMenu(obj: Interactive, evt: L.LeafletMouseEvent): void {
    const items = obj.onContextMenu ? obj.onContextMenu(evt) : [];

    if (!items || items.length === 0) return;

    this.currentContextMenuTarget = obj;
    this.currentContextMenuItems = items;

    const ul = document.createElement('ul');
    ul.onclick = this.handleContextMenuClick;

    ul.innerHTML = items
      .map((x) => {
        return `<li><a data-value="${x.value}" href="javascript:void(0);">${x.text}</a></li>`;
      })
      .join('');

    this.contextmenuPopup.setContent(ul).setLatLng(evt.latlng).addTo(this.map);
  }

  onPress(layer: ReactiveLayer, evt: L.LeafletMouseEvent): void {
    const startPoint = evt.containerPoint.clone();
    const mapDragging = this.map.dragging;
    const isMapDraggingDisabled = mapDragging.enabled();
    let dragged = false;

    if (isMapDraggingDisabled) {
      mapDragging.disable();
    }

    const onMove = (evt: MouseEvent) => {
      evt.stopPropagation();
      const containerPoint = this.map.mouseEventToContainerPoint(evt);

      const x = containerPoint.x;
      const y = containerPoint.y;

      const dx = x - startPoint.x;
      const dy = y - startPoint.y;

      if (dx || dy) {
        const dLatLng = this.map.unproject([dx, dy]);
        layer.translate(dLatLng.lat, dLatLng.lng);

        startPoint.x = x;
        startPoint.y = y;

        dragged = true;
      }
    };

    const onUp = (evt: MouseEvent) => {
      evt.stopPropagation();

      if (isMapDraggingDisabled) {
        mapDragging.enable();
      }

      if (dragged) {
        layer.cancelObjClickEvent();
      }

      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
}
