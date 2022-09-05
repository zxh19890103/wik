export interface WithSnap<S = any> {
  snapshot(): void;
  getSnapshot(): S;
  toSnapshot(): S;
}
