export class HrEvent<S = any, T = any> {
  readonly type: string = null;
  readonly target: T = null;
  readonly source: S = null;
  readonly payload: any = null;

  readonly timeStamp = performance.now();

  stopped = false;

  constructor(s: S, type: string, payload?: any) {
    this.source = s;
    this.type = type;
    this.payload = payload;
  }

  stop() {
    this.stopped = true;
  }
}
