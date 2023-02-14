import { Constructor, AbstractConstructor } from '@/interfaces/Constructor';
import { IInjector, WithInjector } from '@/interfaces/Injector';
import * as Interfaces from '@/interfaces/symbols';
import { Entries, fromEntries, toEntries } from '@/utils';
import { writeReadonlyProp } from './mixin';

/**
 * If parent-child relation has not created, we cannot access injector Hierarchically.
 *
 * You try to create a Child, which is a child of a Parent.
 * Both Parent and Child are providers, which means both have injector.
 * Child has dependencies of parameters and properties, some of which should come from Parent's providers.
 * Now. you firstly create an injector for Child, that's OK.
 * But how the dependencies on Parent are obtained ?
 *
 * Q: How about services are depended by each other?
 */

/**
 * be inspired of Angular2.
 * @see https://angular.io/guide/hierarchical-dependency-injection
 */

export class Injector implements IInjector {
  parent: IInjector;

  private values: Map<Symbol, any> = new Map();
  private providers: Map<Symbol, Provider> = new Map();

  readonly own: WithInjector;
  readonly writeProp: (o: object, prop: string, value: any) => void;

  constructor(private C: Constructor) {
    this.loadProviders();
    this.writeProp = writeReadonlyProp;
  }

  /**
   * load or reload providers,
   * keep in mind! we don't  re-bind the dependencies that have already bound.
   */
  loadProviders() {
    const _providers = globalProviders.get(this.C) || {};
    const symbols = Object.getOwnPropertySymbols(_providers);
    for (const name of symbols) {
      this.providers.set(name, _providers[name]);
    }
  }

  $new<T extends object>(C: Constructor<T>, ...args: any[]): T {
    // Firstly, we create the injector if C is a provider.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let inj: Injector = this;
    if (globalProviders.has(C)) {
      inj = new Injector(C);
      inj.parent = this;
    }

    const params = getParamsDeps(C, inj);

    console.log('Class', C);
    console.log('Params', params);
    console.log('Args', args);

    /**
     * What IF we need access injector in construtor ?
     */
    const instance = new C(...params, ...args) as unknown as T;

    writeReadonlyProp(instance as object, 'injector', inj);

    if (inj !== this) {
      writeReadonlyProp(inj, 'own', instance);
    }

    writeDeps(instance, inj);

    return instance;
  }

  get<T>(token: symbol): T {
    let value = this.values.get(token);

    // if created.
    if (value) {
      return value;
    }

    // if there is no value, we create it now.
    if (this.providers.has(token)) {
      const provider = this.providers.get(token);

      value = this.getService(provider);

      this.values.set(token, value);
      return value;
    }

    // find on parent.
    if (this.parent) {
      return this.parent.get(token);
    }

    if (!__PROD__) {
      throw new Error(`No any provider provides ${token.description}`);
    }

    return null;
  }

  /**
   * get a service from a provider.
   */
  private getService(provider: Provider) {
    if (provider.useClass !== undefined) {
      const C = provider.useClass;
      const params = getParamsDeps(C, this);
      const value = new C(...params);
      writeReadonlyProp(value, 'injector', this);
      writeDeps(value, this);
      return value;
    } else if (provider.useFactory !== undefined) {
      return provider.useFactory();
    } else if (provider.useValue !== undefined) {
      return provider.useValue;
    } else {
      return null;
    }
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

export type Provider = { useClass?: Constructor; useValue?: any; useFactory?: () => any };
export type ConfigProviderConfigValue = Provider | Constructor;
type ProviderWithSymbol = Provider & { provide: symbol };

class Root {}

const graphNodes: Map<GraphNodeTarget | InjectToken, GraphNode> = new Map();
const globalProviders: Map<AbstractConstructor, Record<symbol, Provider>> = new Map();

export const rootInjector = new Injector(Root);

export function configProviders(
  target: AbstractConstructor | 'root',
  config: Record<symbol, ConfigProviderConfigValue> | Array<ProviderWithSymbol>,
) {
  const _target = target === 'root' ? Root : target;
  const _config = globalProviders.get(_target);

  let more = {};

  const proto = Object.getPrototypeOf(config);

  if (proto === Object.prototype) {
    // Object
    const entries = toEntries(config);

    for (const [key, value] of entries) {
      if (Object.getPrototypeOf(value) === Object.prototype) {
        // It's Provider
        more[key] = value;
      } else {
        // It's Constructor
        more[key] = { useClass: value };
      }
    }
  } else if (proto === Array.prototype) {
    // Array
    more = fromEntries(
      Array.prototype.map.call(config, (c: ProviderWithSymbol) => {
        return [c.provide, c];
      }) as Entries<symbol, Provider>,
    );
  }

  globalProviders.set(_target, { ..._config, ...more });

  if (target === 'root') {
    rootInjector.loadProviders();
  }
}

function getParamsDeps(c: Constructor, _injector: IInjector) {
  const node = graphNodes.get(c);

  console.log('getParamsDeps has node?', node);

  if (!node) {
    return [];
  }

  console.log('yes, has node. and paramsDeps = ', node.paramsDeps);

  return node.paramsDeps.map((x) => {
    if (x.child.token === Interfaces.IInjector) {
      return _injector;
    }
    return _injector.get(x.child.token);
  });
}

function writeDeps(target: any, _injector: Injector) {
  const deps = getDeps(target.constructor);

  for (const dep of deps) {
    // we create the value if it does not exists
    const value = _injector.get(dep.child.token);
    // write the deps on the proto, so that all the subclass instances can access them.
    writeReadonlyProp(target, dep.symbol, value);
    writeDeps(value, _injector);
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

export function getGraphNode(key: GraphNodeTarget | InjectToken) {
  if (!key) return null;

  if (graphNodes.has(key)) {
    return graphNodes.get(key);
  }

  let node: GraphNode;

  if (typeof key === 'symbol') {
    node = {
      token: key,
      _dev_label: `${key.description}`,
      deps: null,
      paramsDeps: null,
    } as TokenGraphNode;
  } else {
    node = {
      target: key,
      _dev_label: `${key.name}`,
      deps: [],
      paramsDeps: [],
    } as TargetGraphNode;
  }

  graphNodes.set(key, node);
  return node;
}

export function createGraphNodeDep(
  parent: TargetGraphNode,
  child: TokenGraphNode,
  symbol?: string | number,
): GraphNodeDep {
  return {
    parent,
    child,
    symbol: String(symbol),
  };
}
