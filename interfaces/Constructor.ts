export type AbstractConstructor<I extends object = object> = abstract new (...args: any[]) => I;

export interface Constructor<I extends object = object> {
  new (...args: any[]): I;
}
