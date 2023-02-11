import { Interactive } from '../../interfaces/Interactive';
import { InteractiveStateAction, InteractiveStateActionName } from './InteractiveStateAction.class';
import { IStateActionManager } from '../../interfaces/StateAction';
import { injectable } from '../basic/inject';
import Interfacces from '../../interfaces/symbols';

const LOOP_SAFE_LIMIT = 5;

@injectable({ providedIn: 'root', provide: Interfacces.IStateActionManager })
export class InteractiveStateActionManager implements IStateActionManager {
  private currentContext: Interactive = null;
  private currType: InteractiveStateActionName = null;

  push(context: Interactive, type: InteractiveStateActionName, data?: any): this {
    const sa = new InteractiveStateAction(context, type, data);

    if (!context.uiStateChangeLogs) context.uiStateChangeLogs = [];

    context.uiStateChangeLogs.push(sa);

    sa.apply();

    return this;
  }

  private _postPop = () => {
    this.currentContext = null;
    this.currType = null;
  };

  pop(context: Interactive, type: InteractiveStateActionName): this {
    this.currentContext = context;
    this.currType = type;

    queueMicrotask(this._postPop);

    const { currentContext: _ctx, currType: _type } = this;

    if (!_ctx || !_type) return;

    const actions = _ctx.uiStateChangeLogs as InteractiveStateAction[];
    if (!actions) return;

    // actions between brace.
    const _actions: InteractiveStateAction[] = [];

    let action = actions.pop();
    let i = 0;

    while (i++ < LOOP_SAFE_LIMIT && action) {
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
      _ctx.uiStateChangeLogs = null;
    }

    return this;
  }

  delete(tag: number): this {
    throw new Error('Method not implemented.');
  }
}
