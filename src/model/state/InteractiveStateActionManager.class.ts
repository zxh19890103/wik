import { Interactive, PossibleUndoableInteractName } from '@/interfaces';
import { InteractiveStateAction } from './InteractiveStateAction.class';
import { IStateActionManager } from '@/interfaces';
import { injectable } from '../basic/inject';
import Interfacces from '@/model/symbols';

@injectable({ providedIn: 'root', provide: Interfacces.IStateActionManager })
export class InteractiveStateActionManager implements IStateActionManager {
  private currentContext: Interactive = null;
  private currType: PossibleUndoableInteractName = null;

  private invokeActionCallback(push: boolean) {
    const { currentContext: _ctx, currType: _type } = this;

    _ctx[`is${_type}ed`] = push;

    const callee = push ? _ctx[`on${_type}ed`] : _ctx[`onUn${_type}ed`];

    if (!callee) return;

    callee.call(_ctx);
  }

  push(context: Interactive, type: PossibleUndoableInteractName, data?: any): this {
    const sa = new InteractiveStateAction(context, type, data);

    if (!context._uiStateChangeLogs) context._uiStateChangeLogs = [];

    context._uiStateChangeLogs.push(sa);

    sa.apply();

    this.currentContext = context;
    this.currType = type;

    queueMicrotask(this._postPushPop);

    this.invokeActionCallback(true);

    return this;
  }

  private _postPushPop = () => {
    this.currentContext = null;
    this.currType = null;
  };

  pop(_ctx: Interactive, _type: PossibleUndoableInteractName): this {
    this.currentContext = _ctx;
    this.currType = _type;

    queueMicrotask(this._postPushPop);

    const actions = _ctx._uiStateChangeLogs as InteractiveStateAction[];
    if (!actions) return;

    // actions between brace.
    const _actions: InteractiveStateAction[] = [];

    let action: InteractiveStateAction = null;

    // undo first, and then redo
    while ((action = actions.pop())) {
      action.revert();

      if (action.type === _type) {
        // skip the action which want to be popped.
        continue;
      } else {
        _actions.unshift(action);
      }
    }

    if (_ctx._headStateHasChanged && _ctx.reRender) {
      _ctx.reRender();
      _ctx._headStateHasChanged = false;
    }

    for (const a of _actions) a.apply();

    this.invokeActionCallback(false);

    actions.push(..._actions);

    if (actions.length === 0) {
      _ctx._uiStateChangeLogs = null;
    }

    return this;
  }

  delete(tag: number): this {
    throw new Error('Method not implemented.');
  }
}
