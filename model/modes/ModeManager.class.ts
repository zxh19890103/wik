import { IInjector, WithInjector } from '../../interfaces/Injector';
import { BehaviorCallback, IBehavior, IMode, IModeManager } from '../../interfaces/Mode';
import { Core, writeReadonlyProp } from '../basic';
import { injectable } from '../basic/inject';
import { Behavior } from '../behaviors';
import { Mode } from './Mode.class';

@injectable()
export class ModeManager extends Core implements IModeManager, WithInjector {
  readonly injector: IInjector;
  modes: Map<string, IMode> = new Map();

  private _mode: IMode = null;

  set mode(val: IMode | string) {
    if (val === this._mode || val === this._mode?.name) return;

    const nm = typeof val === 'string' ? this.modes.get(val) : val;

    if (this._mode) {
      this._mode.unload();
    }

    nm.load();
    this._mode = nm;
    this.fire('change', null);

    // add if it does not exist
    if (!this.modes.has(nm.name)) {
      this.modes.set(nm.name, nm);
    }
  }

  get mode(): IMode {
    return this._mode;
  }

  apply(m: BehaviorCallback, ...args: any[]) {
    if (!this._mode) return;
    for (const behavior of this._mode.behaviors) {
      const fn = behavior[m] as (...args) => void;
      // no need to call an empty method.
      if (fn === Behavior.prototype[m]) continue;
      fn && fn.call(behavior, ...args);
    }
  }

  create(name: string, ...behaviors: IBehavior[]): IMode {
    if (!__PROD__ && this.modes.has(name)) {
      throw new Error('mode name is duplicated.');
    }

    const mode = new Mode(name, ...behaviors);
    this.modes.set(name, mode);
    writeReadonlyProp(mode, 'modeMgr', this);
    return mode;
  }

  add(...modes: IMode[]): void {
    throw new Error('Method not implemented.');
  }

  remove(...modes: IMode[]): void {
    throw new Error('Method not implemented.');
  }
}
