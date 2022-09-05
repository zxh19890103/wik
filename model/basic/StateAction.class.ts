import { Interactive } from '../../interfaces/Interactive';
import { IStateAction } from '../../interfaces/StateAction';
import { CapitalCharacter } from '../../interfaces/types';

let __action_tag = 1999;

export abstract class StateActionBase implements IStateAction {
  readonly tag = __action_tag++;

  abstract apply(): void;
  abstract revert(): void;
}
