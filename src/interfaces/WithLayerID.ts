import { GraphicObject } from './GraghicObject';
import { WithInput } from './WithInput';

export interface WithLayerID {
  layerId: string;
}

export interface LayerWithID extends L.Layer, WithLayerID, GraphicObject, Partial<WithInput> {}
