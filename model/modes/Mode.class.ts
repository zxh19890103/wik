import { IBehavior, IMode } from '../../interfaces/Mode';

export class Mode implements IMode {
  readonly name: string;
  behaviors: IBehavior[];

  constructor(name: string, ...behaviors: IBehavior[]) {
    this.name = name;
    this.behaviors = behaviors;
  }

  onLoad(): void {}
  onUnload(): void {}

  add(b: IBehavior) {
    this.behaviors.push(b);
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
