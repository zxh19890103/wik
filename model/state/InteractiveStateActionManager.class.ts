import { Interactive } from '../../interfaces/Interactive';
import { InteractiveStateAction, InteractiveStateActionName } from './InteractiveStateAction.class';
import Interfacces from '../../interfaces/symbols';
import { IStateActionManager } from '../../interfaces/StateAction';
import { injectable } from '../../model/basic/inject';

const SAFE = 5;

@injectable({ providedIn: 'root', provide: Interfacces.IStateActionManager })
export class InteractiveStateActionManager implements IStateActionManager {
  private _ctx: Interactive = null;
  private _type: InteractiveStateActionName = null;

  push(context: Interactive, type: InteractiveStateActionName): this {
    if (!(context[`on${type}`] && context[`onUn${type}`])) {
      return this;
    }

    const sa = new InteractiveStateAction(context, type);

    if (context.changeHistory) {
      context.changeHistory.push(sa);
    } else {
      context.changeHistory = [sa];
    }

    sa.apply();

    return this;
  }

  private _postPop = () => {
    this._ctx = null;
    this._type = null;
  };

  pop(context: Interactive, type: InteractiveStateActionName): this {
    if (!(context[`on${type}`] && context[`onUn${type}`])) {
      return this;
    }

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

  delete(tag: number): this {
    throw new Error('Method not implemented.');
  }
}
