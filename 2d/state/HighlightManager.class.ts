import { IHighlightManager } from '../../interfaces/Highlight';
import { Interactive } from '../../interfaces/Interactive';
import { InteractiveStateAction } from './InteractiveStateAction.class';
import { InteractiveStateActionManager } from './InteractiveStateActionManager.class';
import { inject, injectable } from '../../model/basic/inject';
import * as Interface from '../../interfaces/symbols';

@injectable()
export class HighlightManager implements IHighlightManager {
  @inject(Interface.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  layers: Set<Interactive> = new Set();

  highlight(...layers: Interactive[]): void {
    for (const layer of layers) {
      if (layer.onHighlight && layer.onUnHighlight) {
        this.layers.add(layer);
        this.interactiveStateActionManager.push(layer, 'Highlight');
      }
    }
  }

  unHighlight(...layers: Interactive[]): void {
    for (const layer of layers) {
      if (!this.layers.has(layer)) continue;

      if (layer.onHighlight && layer.onUnHighlight) {
        this.interactiveStateActionManager.pop(layer, 'Highlight');
      }

      this.layers.delete(layer);
    }
  }

  clear(): void {
    for (const layer of this.layers) {
      this.interactiveStateActionManager.pop(layer, 'Highlight');
    }
    this.layers.clear();
  }
}
