import { IBehavior, IMode, IModeManager } from '../../interfaces/Mode';

export class Mode implements IMode {
  readonly name: string;
  readonly modeMgr: IModeManager;
  behaviors: IBehavior[];

  constructor(name: string, ...behaviors: IBehavior[]) {
    this.name = name;
    this.behaviors = behaviors;
  }

  onLoad(): void {}
  onUnload(): void {}

  add(b: IBehavior, ...bs: IBehavior[]) {
    throw new Error('not implemented');
  }

  remove(b: IBehavior, ...bs: IBehavior[]) {
    throw new Error('not implemented');
  }

  load(): void {
    for (const behavior of this.behaviors) {
      behavior.onLoad();
    }

    this.onLoad && this.onLoad();
  }

  unload(): void {
    for (const behavior of this.behaviors) {
      behavior.onUnload();
    }

    this.onUnload && this.onUnload();
  }
}
