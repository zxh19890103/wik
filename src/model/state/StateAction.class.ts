import { IStateAction } from '@/interfaces/StateAction';

let __action_tag_seed__ = 1999;

export abstract class StateActionBase implements IStateAction {
  readonly tag = __action_tag_seed__++;
  readonly isRedo = 0;

  abstract apply(): void;
  abstract revert(): void;
}
