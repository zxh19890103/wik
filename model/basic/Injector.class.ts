import { Constructor, AbstractConstructor } from '../../interfaces/Constructor';
import { IInjector, WithInjector } from '../../interfaces/Injector';

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
  private values: Map<Symbol, any> = new Map();
  private providers: Map<Symbol, Constructor> = new Map();

  readonly own: WithInjector;
  readonly writeProp: (o: object, prop: string, value: any) => void;
  parent: Injector;

  constructor(c: Constructor) {
    const symbols = Object.getOwnPropertySymbols(providers.get(c) || {});
    for (const name of symbols) {
      this.providers.set(name, providers[name]);
    }

    this.writeProp = writeProp;
  }

  $new<T>(C: Constructor<object>, ...args: any[]): T {
    // Firstly, we create the injector if C is a provider.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let inj: Injector = this;
    if (providers.has(C)) {
      inj = new Injector(C);
      inj.parent = this;
    }

    const params = getParamsDeps(C, inj);
    const instance = new C(...params, ...args) as unknown as T;

    writeProp(instance as object, 'injector', inj);

    if (inj !== this) {
      writeProp(inj, 'own', instance);
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
      const C = this.providers.get(token);

      const params = getParamsDeps(C, this);

      value = new C(...params);
      writeDeps(value, this);

      this.values.set(token, value);
      return value;
    }

    // find on parent.
    if (this.parent) {
      return this.parent.get(token);
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

const graphNodes: Map<GraphNodeTarget | InjectToken, GraphNode> = new Map();
const providers: Map<AbstractConstructor, Record<symbol, Constructor>> = new Map();

export const rootInjector = new Injector(Root);

export function configProviders(
  target: AbstractConstructor | 'root',
  config: Record<symbol, Constructor>,
) {
  const _target = target === 'root' ? Root : target;
  const _config = providers.get(_target);
  providers.set(_target, { ..._config, ...config });
}

function getParamsDeps(c: Constructor, _injector: IInjector) {
  const node = graphNodes.get(c);

  if (!node) {
    return [];
  }

  return node.paramsDeps.map((x) => {
    return _injector.get(x.child.token);
  });
}

function writeDeps(target: any, _injector: IInjector) {
  const deps = getDeps(target.constructor);

  for (const dep of deps) {
    // we create the value if it does not exists
    const value = _injector.get(dep.child.token);
    // write the deps on the proto, so that all the subclass instances can access them.
    writeProp(target, dep.symbol, value);
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

export function writeProp(o: object, prop: string, value: any) {
  Object.defineProperty(o, prop, {
    value,
    writable: false,
    enumerable: false,
    configurable: false,
  });
}
