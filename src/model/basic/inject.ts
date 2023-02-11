import { Constructor, AbstractConstructor } from '../../interfaces/Constructor';
import { queueTask } from '../../utils';
import {
  InjectDecratorArgs,
  TokenGraphNode,
  TargetGraphNode,
  getGraphNode,
  createGraphNodeDep,
  InjectToken,
  configProviders,
  GraphNodeDep,
  ConfigProviderConfigValue,
} from './Injector.class';
import { writeReadonlyProp } from './mixin';

/**
 * just mark a class as an injectable one.
 */
function injectable(config?: { providedIn: 'root'; provide: symbol }) {
  return function (target: AbstractConstructor) {
    // see the last implementation as the valid one.
    writeReadonlyProp(target, '__injectable__', true);
    if (config?.providedIn === 'root') {
      configProviders('root', [{ provide: config.provide, useClass: target as Constructor }]);
    }
  };
}

/**
 * inject a service according to the token, which binds with a constructor.
 */
function inject(token: InjectToken, ...tokens: InjectToken[]) {
  return function (...args: any[]) {
    // Args.length === 1 means it's a class inject
    if (args.length === 1) {
      queueTask({
        key: 'inject' + injectRunIdSeed++,
        run: () => {
          const node = getGraphNode(args[0] as Constructor) as TargetGraphNode;
          let index = 0;
          for (const item of [token, ...tokens]) {
            const child = getGraphNode(item) as TokenGraphNode;
            node.paramsDeps.push(createGraphNodeDep(node, child, index));
            index++;
          }
        },
      });
    } else {
      queueTask({
        key: 'inject' + injectRunIdSeed++,
        run: () => {
          const [target, prop, _] = args as InjectDecratorArgs;

          const node = getGraphNode(target.constructor as Constructor) as TargetGraphNode;
          const node1 = getGraphNode(token) as TokenGraphNode;

          const dep: GraphNodeDep = createGraphNodeDep(node, node1, prop);

          node.deps.push(dep);
        },
      });
    }
  };
}

function provides(config: Record<symbol, ConfigProviderConfigValue>) {
  return function (target: any) {
    configProviders(target, config);
  };
}

let injectRunIdSeed = 1992;

export { injectable, inject, provides };
