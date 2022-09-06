export interface WithSnapshot<S = any> {
  snapshot(): void;
  getSnapshot(): S;
  toSnapshot(): S;
}
