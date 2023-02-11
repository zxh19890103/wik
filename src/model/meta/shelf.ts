import { Base } from './base';
import { Position } from './position';

export interface Rack extends Base {
  width: number;
  depth: number;
  height: number;
  heightPerLayer: number;
  distanceOffGround: number;
}

export interface Pack extends Base {
  width: number;
  depth: number;
  height: number;
}

export interface Board extends Base {
  width: number;
  depth: number;
}

export interface RackPackSlot {
  position: Position;
  layer: number;
  n: number;
  w?: number;
  d?: number;
  h?: number;
}

export interface RackBoardSlot {
  position: Position;
  layer: number;
  w: number;
  h: number;
}
