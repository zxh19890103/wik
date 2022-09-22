import { Constructor, AbstractConstructor } from '../../interfaces/Constructor';
import { IInjector, WithInjector } from '../../interfaces/Injector';

/**
 * be inspired of Angular2.
 * @see https://angular.io/guide/hierarchical-dependency-injection
 */

export class Injector implements IInjector {
  private values: Map<Symbol, any> = new Map();
  private providers: Map<Symbol, Constructor> = new Map();

  withInjector: WithInjector;

  constructor(c: Constructor) {
    const symbols = Object.getOwnPropertySymbols(providers.get(c) || {});
    for (const name of symbols) {
      this.providers.set(name, providers[name]);
    }
  }

  $new<T>(c: Constructor<object>, ...args: any[]): T {
    const params = getParamsDeps(c, this);
    const instance = new c(...params, ...args) as unknown as T;

    const child = this.createChild();
    writeProp(instance as object, 'injector', child);
    writeProp(child, 'withInjector', instance);

    writeDeps(instance);

    return instance;
  }

  createChild(): Injector {
    return null;
  }

  get<T>(token: symbol): T {
    let value = this.values.get(token);
    if (value) return value;

    if (this.providers.has(token)) {
      const C = this.providers.get(token);

      value = new C();

      if (providers.has(C)) {
        const _injector = new Injector(C);
        writeProp(value as object, 'injector', _injector);
        writeProp(_injector, 'withInjector', value);
      }

      writeDeps(value);
      this.values.set(token, value);
      return value;
    }

    let wi = this.withInjector;

    while (wi) {
      if (wi.injector) {
        return wi.injector.get(token);
      }

      wi = wi.$$parent;
    }

    return null;
  }
}

/**
 * must be no-argument
 */
export type InjectToken = symbol;
export type InjectDecratorArgs = [object, string, PropertyDescriptor];
export type GraphNodeTarget = AbstractConstructor;

export interface GraphNode {
  /**
   * for development
   */
  _dev_label?: string;
  /**
   * constructor parameters dependencies
   */
  paramsDeps: GraphNodeDep[];
  /**
   * Properties dependencies
   */
  deps: GraphNodeDep[];
}

export interface TargetGraphNode extends GraphNode {
  /**
   * target is the class having  deps and params deps.
   */
  target: GraphNodeTarget;
}

export interface TokenGraphNode extends GraphNode {
  /**
   * thing's token that would be injected.
   */
  token: InjectToken;
}

export type GraphNodeDep = {
  parent: TargetGraphNode;
  child: TokenGraphNode;
  /**
   * the property name
   */
  symbol: string;
};

class Root {}
export const rootInjector = new Injector(Root);
export const graphNodes: Map<GraphNodeTarget | InjectToken, GraphNode> = new Map();
export const providers: Map<AbstractConstructor, Record<symbol, Constructor>> = new Map();

function getInstanceOfDep(dep: GraphNodeDep, _injector: IInjector) {
  const { child } = dep;
  return _injector.get(child.token);
}

function getParamsDeps(c: Constructor, _injector: IInjector) {
  const node = graphNodes.get(c);

  if (!node || node.paramsDeps.length === 0) {
    return [];
  }

  return node.paramsDeps.map((x) => {
    return getInstanceOfDep(x, _injector);
  });
}

function writeDeps(target: any) {
  const deps = getDeps(target.constructor);
  const _injector = getInjector(target);

  for (const dep of deps) {
    // we create the value if it does not exists
    const value = getInstanceOfDep(dep, _injector);
    // write the deps on the proto, so that all the subclass instances can access them.
    writeProp(target, dep.symbol, value);
    writeDeps(value);
  }
}

/**
 * resolve all dependencies
 */
function getDeps(c: AbstractConstructor) {
  let ctor = c;

  const deps: GraphNodeDep[] = [];

  while (ctor) {
    if (graphNodes.has(ctor)) {
      const addons = graphNodes.get(ctor).deps;
      deps.push(...addons);
    }

    ctor = Object.getPrototypeOf(ctor.prototype)?.constructor;
  }

  return deps;
}

function getInjector(target: any): IInjector {
  let o = target;

  while (o) {
    if (Object.hasOwn(o, 'injector')) {
      return o.injector;
    }

    o = o.$$parent;
  }

  return rootInjector;
}

function writeProp(o: object, prop: string, value: any) {
  Object.defineProperty(o, prop, {
    value,
    writable: false,
    enumerable: false,
    configurable: false,
  });
}
