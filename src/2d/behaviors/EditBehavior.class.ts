import L from 'leaflet';
import { Interactive } from '@/interfaces';
import { ContextMenuItem } from '@/interfaces';
import { ReactiveLayer } from '@/mixins';
import { IWarehouse, Behavior } from '@/model';
import { WikMap } from '../basic/Map.class';

export class EditBehavior extends Behavior {
  private ogirin: L.Marker = null;
  private currentContextMenuTarget = null;
  private currentContextMenuItems: ContextMenuItem[] = null;
  private contextmenuPopup: L.Popup = null;

  constructor(private warehouse: IWarehouse, private map: WikMap) {
    super();
  }

  onLoad(): void {
    this.ogirin = L.marker([0, 0]).addTo(this.map);

    this.contextmenuPopup = new L.Popup({
      keepInView: true,
      closeButton: false,
      closeOnClick: true,
      className: 'wik-contextmenu',
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
      const ccmt = this.currentContextMenuTarget;

      if (item && item.callback) {
        if (typeof item.callback === 'string') {
          ccmt[item.callback] && ccmt[item.callback]();
        } else {
          item.callback();
        }
      } else if (ccmt.onContextMenuClick) {
        ccmt.onContextMenuClick(value);
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
    /**
     * the target to translate or call on-methods.
     */
    const target = layer.$$system || layer;
    const asInteractive = target as unknown as Interactive;

    const startPoint = evt.layerPoint.clone();
    const mapDragging = this.map.dragging;
    const isMapDraggingDisabled = mapDragging.enabled();
    let dragged = false;

    if (isMapDraggingDisabled) {
      mapDragging.disable();
    }

    const onMove = (evt: MouseEvent) => {
      evt.stopPropagation();
      const containerPoint = this.map.mouseEventToLayerPoint(evt);

      const x = containerPoint.x;
      const y = containerPoint.y;

      const dx = x - startPoint.x;
      const dy = y - startPoint.y;

      if (dx || dy) {
        const dLatLng = this.map.unproject([dx, dy]);

        target._syncRenderOnce = true;
        target.translate(dLatLng.lat, dLatLng.lng);
        asInteractive.onDragging && asInteractive.onDragging();

        startPoint.x = x;
        startPoint.y = y;

        if (!dragged) {
          asInteractive.onDragStart && asInteractive.onDragStart();
          dragged = true;
        }
      }
    };

    const onUp = (evt: MouseEvent) => {
      evt.stopPropagation();

      if (isMapDraggingDisabled) {
        mapDragging.enable();
      }

      if (dragged) {
        asInteractive.onDragEnd && asInteractive.onDragEnd();
        target.cancelClickEventFire();
      }

      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
}
