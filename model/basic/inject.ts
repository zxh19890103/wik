import { Constructor, AbstractConstructor } from '../../interfaces/Constructor';
import { quequeTask } from '../../utils';
import { Injector } from './Injector.class';

/**
 *  binds = <Symbol - Constructor>
 *
 *  inject : create a child node, appended to `deps` array of Target (which is a node too.)
 *
 *  injectable: mark it injectable.
 *
 *  injectEntry: self is not injectable, but could depend others.
 *
 *
 *
 */

/**
 * must be no-argument
 */
type InjectToken = symbol;
type InjectDecratorArgs = [object, string, PropertyDescriptor];
type GraphNodeTarget = AbstractConstructor;

interface GraphNode {
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

interface TargetGraphNode extends GraphNode {
  /**
   * target is the class having  deps and params deps.
   */
  target: GraphNodeTarget;
}

interface TokenGraphNode extends GraphNode {
  /**
   * thing's token that would be injected.
   */
  token: InjectToken;
}

type GraphNodeDep = {
  parent: TargetGraphNode;
  child: TokenGraphNode;
  /**
   * the property name
   */
  symbol: string;
};

const graphNodes: Map<GraphNodeTarget | InjectToken, GraphNode> = new Map();
namespace injector {
  export function $new<T>(c: Constructor, ...args: any[]): T {
    if (isInjectable(c)) {
      throw new Error(`no, ${c.name} should not be injectable.`);
    }

    const _injector = new Injector();
    const ctorArgs = getCtorInjectArgs(c);
    const instance = new c(...ctorArgs, ...args) as unknown as T;

    let ctor = c as Constructor;

    while (ctor) {
      if (graphNodes.has(ctor)) {
        const n = graphNodes.get(ctor);
        writeDeps(n);
      }

      ctor = Object.getPrototypeOf(ctor.prototype)?.constructor;
    }

    return instance;
  }

  export function bind(key: InjectToken, value: Constructor) {
    // tokenToConstructorMapping.set(key, value);
    // constructorToTokenMapping.set(value, key);
  }

  function getCtorInjectArgs(c: Constructor) {
    const node = graphNodes.get(c);

    if (!node || node.paramsDeps.length === 0) {
      return [];
    }

    return node.paramsDeps.map((x) => {
      return getInstanceOfNode(x.child);
    });
  }

  function writeDeps(n: GraphNode) {
    const instance = getInstanceOfNode(n);

    for (const dep of n.deps) {
      const { child } = dep;
      // we create the value if it does not exists
      const value = getInstanceOfNode(child);
      // write the deps on the proto, so that all the subclass instances can access them.
      writeProp(instance, dep.symbol, value);
      writeDeps(child);
    }
  }

  export function injectable(o: AbstractConstructor) {
    if (!__PROD__ && o.length > 0) {
      throw new Error(`constructor ${o.name} must have no constructing parameters.`);
    }

    writeProp(o, '__injectable__', true);
  }

  export function isInjectable(o: AbstractConstructor) {
    return o['__injectable__'] || false;
  }

  export function writeProp(o: object, prop: string, value: any) {
    Object.defineProperty(o, prop, {
      value,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  }
}

/**
 * just mark a class as an injectable one.
 */
function injectable() {
  return function (target: AbstractConstructor) {
    // see the last implementation as the valid one.
    injector.injectable(target);
  };
}

/**
 * inject a service according to the token, which binds with a constructor.
 */
function inject(token: InjectToken) {
  return function (...args: any[]) {
    quequeTask({
      key: 'inject' + injectRunIdSeed++,
      run: () => {
        const [target, prop, _] = args as InjectDecratorArgs;

        const node = getGraphNode(target.constructor as Constructor) as TargetGraphNode;
        const node1 = getGraphNode(token) as TokenGraphNode;

        const dep: GraphNodeDep = createGraphNodeDep(node, node1, prop);

        node.deps.push(dep);
      },
    });
  };
}

function injectCtor(...tokens: InjectToken[]) {
  return function (target: any) {
    quequeTask({
      key: 'injectCtor' + injectRunIdSeed++,
      run: () => {
        const node = getGraphNode(target as Constructor) as TargetGraphNode;
        let index = 0;
        for (const token of tokens) {
          const child = getGraphNode(token) as TokenGraphNode;
          node.paramsDeps.push(createGraphNodeDep(node, child, index));
          index++;
        }
      },
    });
  };
}

function getGraphNode(key: GraphNodeTarget | InjectToken) {
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

function createGraphNodeDep(
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

let injectRunIdSeed = 1992;

export { injectable, inject, injectCtor, injector };
