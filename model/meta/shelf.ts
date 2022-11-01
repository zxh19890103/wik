import { Base } from './base';

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
