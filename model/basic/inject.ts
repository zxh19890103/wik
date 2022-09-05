import { Constructor, AbstractConstructor } from '../../interfaces/Constructor';

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
type NodeKey = AbstractConstructor;

type GraphNode = {
  key: NodeKey;
  token: InjectToken;
  _dev_label?: string;
  value: any;
  /**
   * constructor parameters dependencies
   */
  paramsDeps: GraphNodeDep[];
  /**
   * Properties dependencies
   */
  deps: GraphNodeDep[];
};

type GraphNodeDep = {
  parent: GraphNode;
  child: GraphNode;
  symbol: string;
};

const keyNodeMapping: Map<NodeKey, GraphNode> = new Map();
const tokenInstanceMapping: Map<InjectToken, object> = new Map();
const binds: Map<InjectToken, Constructor> = new Map();
const binds2: Map<Constructor, InjectToken> = new Map();

namespace injector {
  export function $new<T>(c: Constructor, ...args: any[]): T {
    if (isInjectable(c)) {
      throw new Error(`no, ${c.name} should not be injectable.`);
    }

    const ctorArgs = getCtorInjectArgs(c);
    const instance = new c(...ctorArgs, ...args) as unknown as T;

    let ctor = c as Constructor;

    const chain = [];

    while (ctor) {
      if (keyNodeMapping.has(ctor)) {
        const n = keyNodeMapping.get(ctor);
        const _val = n.value;
        n.value = instance;
        writeDeps(n);
        n.value = _val;
      }

      chain.push(ctor.name);

      ctor = Object.getPrototypeOf(ctor.prototype)?.constructor;
    }

    // console.log(chain.join('->'));

    return instance;
  }

  export function bind(key: InjectToken, value: Constructor) {
    binds.set(key, value);
    binds2.set(value, key);
  }

  function getCtorInjectArgs(c: Constructor) {
    const node = keyNodeMapping.get(c);

    if (!node && node.paramsDeps.length === 0) {
      return [];
    }

    return node.paramsDeps.map((x) => {
      instantiateNode(x.child);
      return x.child.value;
    });
  }

  function writeDeps(n: GraphNode) {
    const instance = n.value;

    for (const dep of n.deps) {
      const { child } = dep;
      // we create the value if it does not exists
      instantiateNode(child);
      // write the deps on the proto, so that all the subclass instances can access them.
      writeProp(instance, dep.symbol, child.value);
      writeDeps(child);
    }
  }

  function instantiateNode(node: GraphNode) {
    if (node.value) return;
    const { token, key } = node;

    // managed!
    if (!__PROD__ && !isInjectable(key)) {
      throw new Error(`no no no... ${node._dev_label} should be injectable!`);
    }

    // it's singleton
    if (tokenInstanceMapping.has(token)) {
      node.value = tokenInstanceMapping.get(token);
    } else {
      const c = key as Constructor;
      node.value = new c();
      tokenInstanceMapping.set(token, node.value);
    }
  }

  export function injectable(o: AbstractConstructor) {
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
    console.log('injectable', target.name);
  };
}

/**
 * inject a service according to the token, which binds with a constructor.
 */
function inject(key: InjectToken) {
  return function (...args: any[]) {
    addInjectReq(() => {
      const ctor = binds.get(key);
      if (!ctor) {
        console.log('inject child... failed for no ctor mapping');
        return;
      }

      const [target, prop, _] = args as InjectDecratorArgs;

      const parentCtor = target.constructor as Constructor;

      console.log('inject child... ', parentCtor.name + '.' + prop, ctor.name);

      const node = get(parentCtor);
      const node1 = get(ctor);

      const dep: GraphNodeDep = createDep(node, node1, prop);

      node.deps.push(dep);
    });
  };
}

function injectCtor(...tokens: InjectToken[]) {
  return function (target: any) {
    addInjectReq(() => {
      const ctor = target as Constructor;
      const node = get(ctor);
      let index = 0;
      for (const token of tokens) {
        const child = get(binds.get(token));
        node.paramsDeps.push(createDep(node, child, index));
        index++;
      }
    });
  };
}

function get(key: NodeKey) {
  if (!key) return null;

  if (keyNodeMapping.has(key)) {
    return keyNodeMapping.get(key);
  }

  const node = createNode(key);
  keyNodeMapping.set(key, node);

  return node;
}

/**
 *  one key, one token ?
 */
function createNode(key: NodeKey): GraphNode {
  const token = binds2.get(key as Constructor) || null;

  return {
    key: key,
    token,
    value: null,
    _dev_label: `${key.name}`,
    deps: [],
    paramsDeps: [],
  };
}

function createDep(parent: GraphNode, child: GraphNode, symbol?: string | number): GraphNodeDep {
  return {
    parent,
    child,
    symbol: String(symbol),
  };
}

let _scheduled = false;
const injectReqs: Set<VoidFunction> = new Set();

const addInjectReq = (val) => {
  injectReqs.add(val);
  if (_scheduled) return;
  _scheduled = true;
  queueMicrotask(flushReqs);
};

const flushReqs = () => {
  console.log('flush inject requests.');
  for (const req of injectReqs) {
    req();
  }

  injectReqs.clear();
  _scheduled = false;
};

export { injectable, inject, injectCtor, injector };
