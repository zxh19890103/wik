import * as o2d from './2d';
import * as o3d from './3d';
import * as dom from './dom';
import * as utils from './utils';
import * as model from './model';

export { o2d, o3d, dom, utils, model };

const _default_ = { o2d, o3d, dom, utils, model };

export default _default_;

window['hrGUI'] = _default_;
