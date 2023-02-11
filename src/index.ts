import * as o2d from './2d';
import * as o3d from './3d';
import * as dom from './dom';
import * as utils from './utils';
import * as model from './model';

const __wik__ = {
  o2d,
  o3d,
  dom,
  utils,
  model,
  React: null,
  ReactDOM: null,
  L: null,
  THREE: null,
};

if (Object.hasOwn(window, 'wik')) {
  throw new Error('Oh, no..., wik has been used in global, please contact the author.');
}

window['__wik__'] = __wik__;

export { o2d, o3d, dom, utils, model };

export default __wik__;
