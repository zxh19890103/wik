import { Interactive } from '../interfaces/Interactive';
import { StateActionManager } from '../model/basic/StateActionManager.class';
import { injectable } from '../model/basic/inject';
import { InteractiveStateAction, InteractiveStateActionName } from './InteractiveStateAction.class';

const SAFE = 5;

@injectable()
export class InteractiveStateActionManager extends StateActionManager {
  private _ctx: Interactive = null;
  private _type: InteractiveStateActionName = null;

  push(sa: InteractiveStateAction): this {
    const { context } = sa;
    if (!context.changeHistory) {
      context.changeHistory = [sa];
    } else {
      context.changeHistory.push(sa);
    }

    sa.apply();

    return this;
  }

  private _postPop = () => {
    this._ctx = null;
    this._type = null;
  };

  pop(context: Interactive, type: InteractiveStateActionName): this {
    this._ctx = context;
    this._type = type;

    queueMicrotask(this._postPop);

    const { _ctx, _type } = this;

    if (!_ctx || !_type) return;

    console.log('pop', _type);

    const actions = _ctx.changeHistory as InteractiveStateAction[];
    if (!actions) return;

    console.log(
      'pop start',
      actions.map((a) => a.type),
    );

    // actions between brace.
    const _actions: InteractiveStateAction[] = [];

    let action = actions.pop();
    let i = 0;

    while (i++ < SAFE && action) {
      console.log('pop revert', action.type);
      action.revert();

      if (action.type === _type) {
        break;
      } else {
        _actions.unshift(action);
      }

      action = actions.pop();
    }

    console.log(
      'pop middle',
      _actions.map((a) => a.type),
    );

    for (const a of _actions) a.apply();

    actions.push(..._actions);

    console.log(
      'pop end',
      actions.map((a) => a.type),
    );

    if (actions.length === 0) {
      _ctx.changeHistory = null;
    }

    return this;
  }
}

export interface WithInteractiveStateActionManager {
  readonly interactiveStateActionManager: InteractiveStateActionManager;
}
