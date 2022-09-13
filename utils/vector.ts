import { D2R, R2D } from '../2d/basic/constants';

const { PI, sqrt, asin, sin, cos } = Math;

export const HALF_PI = PI / 2;
export const DEFAULT_ZERO_VECTOR: L.LatLngLiteral = { lat: 0, lng: 1 }; // default [0, 1]
export const DEFAULT_ZERO_RAD = 0 * D2R; // default 0  angle between [0, 1] and [1,0]

export const distanceBetween = (p0: L.LatLngLiteral, p1: L.LatLngLiteral) => {
  const dx = p1.lng - p0.lng;
  const dy = p1.lat - p0.lat;
  return sqrt(dx * dx + dy * dy);
};

export const lengthOf = (vec: L.LatLngLiteral) => {
  return sqrt(vec.lat * vec.lat + vec.lng * vec.lng);
};

/**
 * returns a unit vector representing the angle in radian format.
 * @param rad clockwise is positive. counterClockwise is negative.
 * @returns
 */
export const rad2vector = (rad: number): L.LatLngLiteral => {
  const lat = sin(rad + DEFAULT_ZERO_RAD);
  const lng = cos(rad + DEFAULT_ZERO_RAD);

  return {
    lat,
    lng,
  };
};

export const vector2rad = (vec: L.LatLngLiteral): number => {
  // cross = fromX * toY - fromY * toX;
  const leng = sqrt(vec.lat * vec.lat + vec.lng * vec.lng);

  // unknown
  if (leng === 0) {
    return 0;
  }

  const y = vec.lat / leng;
  const x = vec.lng / leng;

  const { lat, lng } = DEFAULT_ZERO_VECTOR;

  const sine = lng * y - lat * x;
  const cosine = lat * y + lng * x;

  // @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/asin
  // -.5 pi - .5 pi
  const cross = asin(sine);

  if (sine > 0 && cosine > 0) {
    // 1 > 0
    return cross;
  } else if (sine > 0 && cosine < 0) {
    // 2 > 0
    return PI - cross;
  } else if (sine < 0 && cosine < 0) {
    // 3 < 0
    return PI - cross;
  } else if (sine < 0 && cosine > 0) {
    // 4
    return cross + 2 * PI;
  } else if (sine === 0) {
    return cosine > 0 ? 0 : PI;
  } else if (cosine === 0) {
    return sine > 0 ? HALF_PI : 1.5 * PI;
  }

  return 0;
};

console.log(vector2rad({ lat: -1, lng: 0 }) * R2D);
