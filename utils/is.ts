export const isClass = (c: any) => {
  if (typeof c !== 'function') return false;
  if (c.prototype === undefined) return false;

  return Object.getPrototypeOf(c.prototype) !== Object.prototype;
};

/**
 * check if c is a traditional function, which can be applied by new.
 */
export const isFunction = (c: any) => {
  if (typeof c !== 'function') return false;
  if (c.prototype === undefined) return false;

  return Object.getPrototypeOf(c.prototype) === Object.prototype;
};

export const isArrowFunction = (c: any) => {
  if (typeof c !== 'function') return false;

  return c.prototype === undefined;
};
