export type AbstractConstructor<I extends object = object> = abstract new (...args: any[]) => I;

export interface Constructor<I extends object = object> {
  new (...args: any[]): I;
}

export type Factory<I extends object = object> = (...args: any[]) => I;

export type ConstructorOrFactory<I extends object = object> = Constructor<I> | Factory<I>;
