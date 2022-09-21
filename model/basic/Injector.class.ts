import { Constructor, AbstractConstructor } from '../../interfaces/Constructor';
import { IInjector, WithInjector } from '../../interfaces/Injector';

/**
 * be inspired of Angular2.
 * @see https://angular.io/guide/hierarchical-dependency-injection
 */

export class Injector implements IInjector {
  private values: Map<symbol, object> = new Map();
  private providers: Map<symbol, Constructor> = new Map();

  withInjector: WithInjector;

  $new<T>(c: Constructor<object>, ...args: any[]): T {
    throw new Error('Method not implemented.');
  }

  get<T>(token: symbol): T {
    throw new Error('Method not implemented.');
  }

  writeProp(name: string, value: any): void {
    throw new Error('Method not implemented.');
  }

  injectable(c: AbstractConstructor<object>): void {
    throw new Error('Method not implemented.');
  }

  isInjectable(c: AbstractConstructor<object>): boolean {
    throw new Error('Method not implemented.');
  }
}
