import { IStateAction, IStateActionManager } from '@/interfaces/StateAction';
import { injectable } from '../basic/inject';
import { IRedoUndoManager } from '../symbols';
import { alias, writeProp } from '../basic/mixin';

@alias('pop', 'undo')
@injectable({ providedIn: 'root', provide: IRedoUndoManager })
export class StateActionManager implements IStateActionManager {
  readonly undoLimit = 20;
  readonly redoLimit = 20;

  /**
   * pushed
   */
  private actions: IStateAction[] = [];
  /**
   * popped
   */
  private actions_: IStateAction[] = [];

  private last(tag: number) {
    let i = this.actions.length - 1;
    let action = this.actions[i];

    if (tag === null) {
      return i;
    }

    while (action && action.tag !== tag) {
      action = this.actions[--i];
    }

    return i;
  }

  push(sa: IStateAction): this {
    sa.apply();
    this.actions.push(sa);
    return this;
  }

  delete(tag: number): this {
    if (this.actions.length === 0) return this;

    const last = this.last(tag);

    if (last === -1) return this;

    const actions = this.actions;
    const size = actions.length;

    let i = size - 1;
    let action: IStateAction = null;

    while (i >= last) {
      action = actions[i];
      action.revert();
      i--;
    }

    i++;

    while (i < size) {
      action = actions[i];
      action.apply();
      i++;
    }

    this.actions.splice(last, 1);

    return this;
  }

  pop(): this {
    const action = this.actions.pop();
    if (!action) return this;

    action.revert();

    this.actions_.push(action);

    return this;
  }

  redo() {
    const action = this.actions_.pop();
    if (!action) return this;
    writeProp(action, 'isRedo', action.isRedo + 1);
    this.push(action);
    return this;
  }
}

export interface StateActionManager {
  undo(): this;
}
