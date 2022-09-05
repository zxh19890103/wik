import { Interactive } from './Interactive';

export interface ISelectionManager {
  getCurrent(): Interactive;
  getAll(): Interactive[];

  current(layer: Interactive): void;
  all(layers: Interactive[]): void;
  append(...layers: Interactive[]): void;

  clearCurrent(): void;
  clearAll(): void;
  clear(): void;
}
