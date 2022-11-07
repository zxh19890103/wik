import { Interactive } from '../../interfaces/Interactive';
import { IStateAction } from '../../interfaces/StateAction';
import { StateActionBase } from './StateAction.class';

/**
 * Must be start with captical char.
 */
export type InteractiveStateActionName = 'Hover' | 'Highlight' | 'Select';

/**
 * @todo
 *
 * 1. Support arguments
 * 2. Support providing speicfied functions pairs
 * 3. Support providing specified couple names: do & undo
 */
export class InteractiveStateAction extends StateActionBase implements IStateAction {
  public readonly type: InteractiveStateActionName;

  private data: any = null;
  private _do: string;
  private _undo: string;

  private applied = false;

  constructor(public context: Interactive, type: InteractiveStateActionName) {
    super();

    this.type = type;

    this._do = 'on' + type;
    this._undo = 'onUn' + type;
  }

  private setIsValue(val: boolean) {
    switch (this.type) {
      case 'Highlight':
        this.context.isHighlight = val;
        break;
      case 'Hover':
        this.context.isHover = val;
        break;
      case 'Select':
        this.context.isSelected = val;
        break;
    }
  }

  apply() {
    if (this.applied) return;

    if (this.context[this._do]) {
      this.data = this.context[this._do]();
    }

    this.setIsValue(true);
    this.applied = true;
  }

  revert() {
    if (!this.applied) return;

    if (this.context[this._undo]) {
      this.context[this._undo](this.data);
    }

    this.setIsValue(false);
    this.applied = false;
  }
}
