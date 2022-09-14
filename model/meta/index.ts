export namespace meta {
  interface Base {
    latlng?: L.LatLngExpression;
    angle?: number;
  }

  export interface Shelf extends Base {
    /**
     * 列数
     */
    columns: number;
    /**
     * 排数
     */
    rows: number;
    /**
     * 层数
     */
    layers?: number;
    /**
     * 单位宽（单位：mm）
     */
    unitW?: number;
    totalW?: number;
    /**
     * 单位长 （单位: mm）
     */
    unitL?: number;
    totalL?: number;
    /**
     * 宽方向上的间隔
     */
    gapW?: number;
    /**
     * 长方向上的间隔
     */
    gapL?: number;

    pilarR?: number;
  }

  export type PointPresetType =
    | 'normal'
    | 'labor'
    | 'rest'
    | 'maintence'
    | 'charge'
    | 'haiport'
    | 'conveyor';

  export interface Point extends Base {
    type: PointPresetType;
  }

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

  export interface Warehouse {
    points: Point[];
    shelfs?: Shelf[];
  }
}
