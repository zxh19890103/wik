import { Interactive } from '@/interfaces';
import { IStateAction } from '@/interfaces';
import { StateActionBase } from './StateAction.class';

const noop = () => null;

/**
 * Must be start with captical char.
 */
export type InteractiveStateActionName = 'Hover' | 'Highlight' | 'Select';

const action2is: Record<InteractiveStateActionName, string> = {
  Hover: 'isHover',
  Highlight: 'isHighlight',
  Select: 'isSelected',
};

/**
 * @todo
 *
 * 1. Support arguments
 * 2. Support providing speicfied functions pairs
 * 3. Support providing specified couple names: do & undo
 */
export class InteractiveStateAction extends StateActionBase implements IStateAction {
  public readonly type: InteractiveStateActionName;

  private readonly payload: any = null;
  private data: any = null;

  private readonly doFn: (...args) => any;
  private readonly unDoFn: (...args) => void;
  private readonly fieldIs: string = null;

  private applied = false;

  constructor(public context: Interactive, type: InteractiveStateActionName, payload?: any) {
    super();

    this.type = type;
    this.payload = payload || null;

    this.doFn = context[`on${type}`] || noop;
    this.unDoFn = context[`onUn${type}`] || noop;

    this.fieldIs = action2is[type];
  }

  apply() {
    if (this.applied) return;

    this.data = this.doFn.call(this.context, this.payload);

    this.context[this.fieldIs] = true;
    this.applied = true;
  }

  revert() {
    if (!this.applied) return;

    this.unDoFn.call(this.context, this.data, this.payload);

    this.context[this.fieldIs] = false;
    this.applied = false;
  }
}
