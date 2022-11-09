import { Interactive } from './Interactive';

export interface ISelectionManager {
  getCurrent(): Interactive;
  getMany(): Interactive[];

  current(layer: Interactive, data?: any): void;
  many(layers: Interactive[]): void;
  append(...layers: Interactive[]): void;

  clearCurrent(): void;
  clearMany(): void;
  clear(): void;

  isSelectable(layer: Interactive): boolean;
}
