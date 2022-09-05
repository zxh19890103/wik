import { BehaviorCallback, IBehavior, IMode, IModeManager } from '../../interfaces/Mode';
import { injectable } from '../basic/inject';
import { Behavior } from '../behaviors';
import { Mode } from './Mode.class';

@injectable()
export class ModeManager implements IModeManager {
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

    if (!this.modes.has(nm.name)) {
      this.modes.set(nm.name, nm);
    }
  }

  get mode(): IMode {
    return this._mode;
  }

  apply(m: BehaviorCallback, ...args: any[]) {
    for (const behavior of this._mode.behaviors) {
      const fn = behavior[m] as (...args) => void;
      // no need to call an empty method.
      if (fn === Behavior.prototype[m]) continue;
      fn && fn.call(behavior, ...args);
    }
  }

  create(name: string, ...behaviors: IBehavior[]): IMode {
    const mode = new Mode(name, ...behaviors);
    this.modes.set(name, mode);
    return mode;
  }

  addModes(...modes: IMode[]): void {
    throw new Error('Method not implemented.');
  }

  removeModes(...modes: IMode[]): void {
    throw new Error('Method not implemented.');
  }
}
