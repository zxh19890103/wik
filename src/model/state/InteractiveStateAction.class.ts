import { Interactive, PossibleUndoableInteractName } from '@/interfaces';
import { IStateAction } from '@/interfaces';
import { StateActionBase } from './StateAction.class';

const noop = () => null;

/**
 * @todo
 *
 * 1. Support arguments
 * 2. Support providing speicfied functions pairs
 * 3. Support providing specified couple names: do & undo
 */
export class InteractiveStateAction extends StateActionBase implements IStateAction {
  public readonly type: PossibleUndoableInteractName;

  private readonly payload: any = null;
  private data: any = null;

  private readonly doFn: (...args) => any;
  private readonly unDoFn: (...args) => void;

  private applied = false;

  constructor(public context: Interactive, type: PossibleUndoableInteractName, payload?: any) {
    super();

    this.type = type;
    this.payload = payload || null;

    this.doFn = context[`on${type}`] || noop;
    this.unDoFn = context[`onUn${type}`] || noop;
  }

  apply() {
    if (this.applied) return;

    const ctx = this.context;

    ctx._immediatelyRenderOnce = true;
    this.data = this.doFn.call(ctx, this.payload);
    ctx._immediatelyRenderOnce = false;

    this.applied = true;
  }

  revert() {
    if (!this.applied) return;

    const ctx = this.context;

    ctx._immediatelyRenderOnce = true;
    this.unDoFn.call(ctx, this.data, this.payload);
    ctx._immediatelyRenderOnce = false;

    this.applied = false;
  }
}
