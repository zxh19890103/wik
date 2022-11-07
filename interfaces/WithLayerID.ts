import { GraphicObject } from './GraghicObject';

export interface WithLayerID {
  layerId: string;
}

export interface LayerWithID extends L.Layer, WithLayerID, GraphicObject {}
