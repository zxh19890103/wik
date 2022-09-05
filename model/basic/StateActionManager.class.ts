import { IStateAction, IStateActionManager } from '../../interfaces/StateAction';

export abstract class StateActionManager implements IStateActionManager {
  private actions: IStateAction[] = [];

  private findLast(tag: number) {
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

    const last = this.findLast(tag);

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

  pop(...args: any[]): this {
    const action = this.actions.pop();
    if (action) action.revert();
    return this;
  }
}
