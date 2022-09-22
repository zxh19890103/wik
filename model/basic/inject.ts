import { Constructor, AbstractConstructor } from '../../interfaces/Constructor';
import { IInjector } from '../../interfaces/Injector';
import { quequeTask } from '../../utils';
import {
  Injector,
  InjectDecratorArgs,
  TokenGraphNode,
  TargetGraphNode,
  InjectToken,
  graphNodes,
  providers,
  GraphNodeDep,
  GraphNodeTarget,
  GraphNode,
} from './Injector.class';

class App {}

const rootInjector = new Injector(App);

namespace injector {
  export function $new<T>(c: Constructor, ...args: any[]): T {
    if (isInjectable(c)) {
      throw new Error(`no, ${c.name} should not be injectable.`);
    }

    let _injector = rootInjector;
    if (providers.has(c)) {
      _injector = new Injector(c); // create injector #1
    }

    const params = getParamsDeps(c, _injector);
    const instance = new c(...params, ...args) as unknown as T;

    writeProp(instance as object, 'injector', _injector);
    writeProp(_injector, 'withInjector', instance);

    writeDeps(instance);

    return instance;
  }

  export function bind(key: InjectToken, value: Constructor) {
    // tokenToConstructorMapping.set(key, value);
    // constructorToTokenMapping.set(value, key);
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

  export function injectable(o: AbstractConstructor) {
    if (!__PROD__ && o.length > 0) {
      throw new Error(`constructor ${o.name} must have no constructing parameters.`);
    }

    writeProp(o, '__injectable__', true);
  }

  export function isInjectable(o: AbstractConstructor) {
    return o['__injectable__'] || false;
  }

  function getInstanceOfDep(dep: GraphNodeDep, _injector: IInjector) {
    const { child } = dep;
    return _injector.get(child.token);
  }

  /**
   * given an object, may it has some dependencies?
   * if yes, returns the injector which is the nearest.
   *
   * ! just access, no creating.
   *
   * $$parent is the field which describes the parent-child relation.
   */
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

function provides(config: Record<symbol, Constructor>) {
  return function (target: any) {
    providers.set(target, config);
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
