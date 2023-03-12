import { GraphicObject } from './GraghicObject';
import { WithInput } from './WithInput';

/**
 * @todo move to 2d
 */

export interface WithLayerID {
  layerId: string;
}

export interface LayerWithID extends L.Layer, WithLayerID, GraphicObject, Partial<WithInput> {}
