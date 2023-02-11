import { Base } from './base';

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
