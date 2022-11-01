import { Base } from './base';

export interface Robot {
  type: 'kubo' | 'kiva';
}

export interface CacheShelf extends Base {}

export type HaiportType = 'OUT' | 'IN';
export interface Haiport extends Base {
  type: HaiportType;
}

export type ConveyorNodeType = 'OUT' | 'IN' | 'INOUT' | 'EXIT';

export interface ConveyorNode extends Base {
  type: ConveyorNodeType;
}

export type ConveyorType = 'singleIO' | 'multipleIO' | 'sharedIO';

export interface Conveyor {
  type: ConveyorType;
}

export type LocationType = 'rest' | 'labor' | 'maintence';
export interface Location extends Base {
  type: LocationType;
  iconURL?: string;
}

export interface Chargepile extends Base {}

export interface Warehouse {}

export * from './position';
export * from './shelf';
export * from './point';
