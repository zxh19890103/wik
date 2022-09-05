import L from 'leaflet';

const INITIAL_SCALE_FACTOR = 0.0125;
const INITIAL_ZOOM_LEVEL = 0;

/**
 * Represents an affine transformation: a set of coefficients
 * a, b, c, d for transforming a point of a form (x, y) into (a*x + b, c*y + d) and doing the reverse.
 * Used by Leaflet in its projections code.
 */
const HR_CRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(INITIAL_SCALE_FACTOR, 0, -INITIAL_SCALE_FACTOR, 0),
});

export { HR_CRS, INITIAL_SCALE_FACTOR, INITIAL_ZOOM_LEVEL };
