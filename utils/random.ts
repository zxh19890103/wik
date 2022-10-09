const { random } = Math;

export const random2 = (min = 0, max = 1) => {
  return min + random() * (max - min);
};

export const randomColor = () => {
  return '#' + random().toString(16).substring(2, 8);
};

/**
 * around the origin [0, 0]
 *
 * r should be greater than zero
 */
export const randomLatLng = (r = 1000): L.LatLngTuple => {
  const base = -r;
  const factor = 2 * r;

  return [base + random() * factor, base + random() * factor];
};
