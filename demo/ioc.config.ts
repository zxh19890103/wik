import * as Interfaces from '../interfaces/symbols';

import { GlobalConstManager } from '../model/basic/GlobalConstManager.class';
import { configProviders } from '../model/basic/Injector.class';
import { ImageManager } from '../2d/state';

configProviders('root', {
  [Interfaces.IImageManager]: ImageManager,
  [Interfaces.IGlobalConstManager]: GlobalConstManager,
  // [Interfaces.ILogger]: console,
});
