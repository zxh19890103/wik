import { Constructor, AbstractConstructor } from '../../interfaces/Constructor';
import { quequeTask } from '../../utils';
import {
  InjectDecratorArgs,
  TokenGraphNode,
  TargetGraphNode,
  getGraphNode,
  createGraphNodeDep,
  InjectToken,
  configProviders,
  GraphNodeDep,
  writeProp,
  ConfigProviderConfigValue,
} from './Injector.class';

/**
 * just mark a class as an injectable one.
 */
function injectable(config?: { providedIn: 'root'; provide: symbol }) {
  return function (target: AbstractConstructor) {
    // see the last implementation as the valid one.
    writeProp(target, '__injectable__', true);
    if (config?.providedIn === 'root') {
      configProviders('root', [{ provide: config.provide, useClass: target as Constructor }]);
    }
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

function provides(config: Record<symbol, ConfigProviderConfigValue>) {
  return function (target: any) {
    configProviders(target, config);
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

let injectRunIdSeed = 1992;

export { injectable, inject, injectCtor, provides };
