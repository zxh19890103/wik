import { GraphicObject } from './GraghicObject';

export interface WithLayerID {
  layerId: string;
}

export interface LayerWithID extends L.Layer, WithLayerID, GraphicObject {}

let __layer_id_seed = 2022;

export const uniqueLayerId = () => {
  return 'layer_' + ++__layer_id_seed;
};
