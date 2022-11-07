/**
 * generate 4 vertices to represent a retangle on z, and be pendicular to the XY plane.
 *
 * left-bottom -> right-bottom -> right-top -> left-top
 *
 * @param halfX half of size on X axe
 * @param halfY half of size on Y axe
 * @param z z
 * @returns
 */
export const generateRetangle = (halfX: number, halfY: number, z = 0) => {
  return [-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0].map((n, i) => {
    switch (i % 3) {
      case 0:
        return halfX * n;
      case 1: {
        return halfY * n;
      }
      case 2: {
        return n + z;
      }
    }
  });
};

export const generatePlane = (l: number, w: number, axe: 'x' | 'y' | 'z', dir: 1 | -1) => {
  return {
    vertices: [],
    normal: [0, 0, 0],
  };
};
