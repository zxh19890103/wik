import L from 'leaflet';
import type { PolylineLatLngs } from '@/interfaces';
import { ReactiveLayer, ReactiveLayerMixin } from '@/mixins';
import { mix } from '@/model';
import { leafletOptions, mapLatLng } from '../utils';
import { DEFAULT_PATH_STYLE } from './constants';

@leafletOptions<L.PolylineOptions>(DEFAULT_PATH_STYLE)
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
