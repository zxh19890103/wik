import { AbstractConstructor, Constructor } from './Constructor';

export interface IInjector {
  $new<T>(c: Constructor, ...args: any[]): T;
  get<T>(token: symbol): T;
  writeProp(name: string, value: any): void;
  injectable(c: AbstractConstructor): void;
  isInjectable(c: AbstractConstructor): boolean;
}

export interface WithInjector {
  /**
   * the parent injector based on this.injector.
   */
  parentInjector: IInjector;
  /**
   * injector that is on current context
   */
  injector: IInjector;
  /**
   * services that would be registerred on current context
   */
  configProvides(): Record<symbol, Constructor>;
}
