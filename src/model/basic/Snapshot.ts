import { Mix } from '@/interfaces';

export abstract class SnapshotMix implements Mix, WithSnapshot<any> {
  private _snapshot = null;
  abstract toSnapshot(): any;

  getMixOptions() {
    return {
      _snapshot: null,
    };
  }

  getSnapshot() {
    return this._snapshot;
  }

  snapshot() {
    if (!this.toSnapshot) {
      if (!__PROD__) {
        console.log('toSnapshot is not implemented!');
      }

      return;
    }

    this._snapshot = this.toSnapshot();
  }
}

export interface WithSnapshotAbstract<S = any> {
  toSnapshot(): S;
}

export interface WithSnapshot<S = any> extends WithSnapshotAbstract<S> {
  getSnapshot(): S;
  snapshot(): void;
}
