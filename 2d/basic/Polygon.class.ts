import L from 'leaflet';
import type { AnyObject, PolylineLatLngs } from '../../interfaces/types';
import { ReactiveLayer } from '../../mixins/ReactiveLayer';
import { ReactiveLayerMixin } from '../../mixins/ReactiveLayer.mixin';
import { WithLayerState } from '../../interfaces/WithLayerState';
import { mix } from '../../model/basic/mixin';
import { leafletOptions } from '../../utils/leaflet';
import { mapLatLng } from '../../utils/mapLatLng';

@leafletOptions<L.PolylineOptions>({
  color: '#fa0087',
  opacity: 1,
  fillColor: '#f09d2a',
  fillOpacity: 1,
})
export class Polygon extends mix(L.Polygon).with<L.Polygon, ReactiveLayer>(ReactiveLayerMixin) {
  constructor(latlngs: PolylineLatLngs, options?: L.PolylineOptions) {
    super(latlngs, options);
    this.latlngs = latlngs;
  }

  onTransform(snapshot: any): void {
    this.setLatLngs(
      mapLatLng(
        this.latlngs,
        (latlng, _latlng) => {
          return this.localToWorld(latlng);
        },
        (this as any)._latlngs,
      ),
    );
  }
}
