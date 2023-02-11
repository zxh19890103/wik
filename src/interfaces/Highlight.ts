import { Interactive } from './Interactive';

export interface IHighlightManager {
  layers: Set<Interactive>;
  highlight(layer: Interactive, ...layers: Interactive[]): void;
  unHighlight(layer: Interactive, ...layers: Interactive[]): void;
  clear(): void;
}
