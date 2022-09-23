import * as Inferfaces from '../interfaces/symbols';

import { ImageManager } from '../2d/basic';
import { GlobalConstManager } from '../model/basic/GlobalConstManager.class';
import { configProviders } from '../model/basic/Injector.class';

configProviders('root', {
  [Inferfaces.IImageManager]: ImageManager,
  [Inferfaces.IGlobalConstManager]: GlobalConstManager,
});
