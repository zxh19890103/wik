export type AbstractConstructor<I = object> = abstract new (...args: any[]) => I;

export interface Constructor<I = object> {
  new (...args: any[]): I;
}
