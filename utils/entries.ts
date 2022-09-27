type AvailablePropertyKey = string | number | symbol;

export const fromEntries = (entries: Array<[k: AvailablePropertyKey, value: any]>) => {
  const output = {};

  for (const ent of entries) {
    output[ent[0]] = ent[1];
  }

  return output;
};

export const toEntries = (o: Record<AvailablePropertyKey, any>) => {
  const symbols = Object.getOwnPropertySymbols(o);
  const properties = Object.getOwnPropertyNames(o);

  const output = [];

  for (const n of [...symbols, ...properties]) {
    output.push([n, o[n]]);
  }

  return output;
};

export type Entries<K extends AvailablePropertyKey, V = any> = Array<[k: K, v: V]>;
