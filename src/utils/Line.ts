export interface LineBuilder<V> {
  at(t: number): V;
  measure(t0: number, t1: number, n?: number): number;
  sample(t0: number, t1: number, n?: number): V[];
  dir(t?: number): V;
  diff(t0: number, t1: number): V;
}
