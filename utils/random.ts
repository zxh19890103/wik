const { random } = Math;

export const random2 = (min = 0, max = 1) => {
  return min + random() * (max - min);
};

export const randomColor = () => {
  return '#' + random().toString(16).substring(2, 8);
};

export const randomLatLng = (r = 1000): L.LatLngTuple => {
  return [random() * r, random() * r];
};
