const { random } = Math;

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
