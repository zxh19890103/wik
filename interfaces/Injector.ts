import { Constructor } from './Constructor';

export interface IInjector {
  /**
   * which object owns this injector.
   *
   * Maybe an object A has the injector refer to this, but A do not own it.
   */
  readonly own: WithInjector;

  /**
   * If you use $new method to create a object A which is provider, A
   */
  parent: IInjector;

  /**
   * Based on this injector, create an object  which may depend providers from this injector.
   * If C is a provider, we create a sub injector, whose parent is the injector.
   */
  $new<T>(C: Constructor, ...args: any[]): T;

  /**
   * get a value from THIS injector in hierarchical.
   */
  get<T>(token: symbol): T;

  /**
   * write an readonly property
   */
  writeProp(o: object, prop: string, value: any): void;
}

export interface WithInjector {
  injector: IInjector;
}
