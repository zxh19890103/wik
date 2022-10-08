import { Interactive } from '../../interfaces/Interactive';
import { StateActionManager } from '../../model/state/StateActionManager.class';
import { injectable } from '../../model/basic/inject';
import { InteractiveStateAction, InteractiveStateActionName } from './InteractiveStateAction.class';
import { IStateActionManager } from '../../interfaces/symbols';

const SAFE = 5;

@injectable({ providedIn: 'root', provide: IStateActionManager })
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

    const actions = _ctx.changeHistory as InteractiveStateAction[];
    if (!actions) return;

    // actions between brace.
    const _actions: InteractiveStateAction[] = [];

    let action = actions.pop();
    let i = 0;

    while (i++ < SAFE && action) {
      action.revert();

      if (action.type === _type) {
        break;
      } else {
        _actions.unshift(action);
      }

      action = actions.pop();
    }

    for (const a of _actions) a.apply();

    actions.push(..._actions);

    if (actions.length === 0) {
      _ctx.changeHistory = null;
    }

    return this;
  }
}
