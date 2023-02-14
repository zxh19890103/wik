import L from 'leaflet';
import { HALF_PI, vector2rad, rad2vector, CubicBezierCurve, leafletOptions } from './utils';
import { Polyline } from './basic/Polyline.class';

@leafletOptions<L.PolylineOptions>({
  weight: 1,
})
export class Edge extends Polyline {
  private from: L.LatLng = L.latLng(0, 0);
  private to: L.LatLng;
  private ctrl0: L.LatLng;
  private ctrl1: L.LatLng;

  bezier: CubicBezierCurve = null;

  constructor() {
    super([]);
  }

  move(latlng: L.LatLngExpression) {
    this.from = L.latLng(latlng);
    return this;
  }

  forwards(latlng: L.LatLngExpression, ctrl0?: L.LatLngExpression, ctrl1?: L.LatLngExpression) {
    this.to = L.latLng(latlng);
    ctrl0 && (this.ctrl0 = L.latLng(ctrl0));
    ctrl1 && (this.ctrl1 = L.latLng(ctrl1));

    if (ctrl0 && ctrl1) {
      const bezier = new CubicBezierCurve(this.from, this.ctrl0, this.ctrl1, this.to);
      const path = bezier.sample(0, 1, 1000);
      this.latlngs = [
        path,
        calcArrow(bezier.at(0.2), bezier.dir(0.2)),
        calcArrow(bezier.at(0.8), bezier.dir(0.8)),
      ];
      this.bezier = bezier;
    } else {
      this.latlngs = calc(this.from, this.to);
    }

    return this;
  }

  onTransform(snapshot: any): void {
    this.setLatLngs(this.latlngs);
  }
}

const calc = (_from: L.LatLngExpression, _to: L.LatLngExpression) => {
  const from = L.latLng(_from);
  const to = L.latLng(_to);

  const vec = {
    lat: to.lat - from.lat,
    lng: to.lng - from.lng,
  };

  const mid = {
    lat: (from.lat + to.lat) / 2,
    lng: (from.lng + to.lng) / 2,
  };

  return [[from, to], calcArrow(mid, vec)];
};

const calcArrow = (at: L.LatLngLiteral, vec: L.LatLngLiteral, size = 300) => {
  const rad = vector2rad(vec);
  const v = rad2vector(rad);
  const v0 = rad2vector(rad + HALF_PI);
  const v1 = rad2vector(rad - HALF_PI);

  const leng = size * 1.618;
  const base = { lat: at.lat - v.lat * leng, lng: at.lng - v.lng * leng };

  return [
    {
      lat: base.lat + v0.lat * size,
      lng: base.lng + v0.lng * size,
    },
    at,
    {
      lat: base.lat + v1.lat * size,
      lng: base.lng + v1.lng * size,
    },
  ];
};
