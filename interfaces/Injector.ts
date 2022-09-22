import { AbstractConstructor, Constructor } from './Constructor';
import { WithParent } from './WithParent';

export interface IInjector {
  $new<T>(c: Constructor, ...args: any[]): T;
  get<T>(token: symbol): T;
}

export interface WithInjector extends WithParent<WithInjector> {
  injector: IInjector;
}
