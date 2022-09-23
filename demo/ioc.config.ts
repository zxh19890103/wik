import * as Inferfaces from '../interfaces/symbols';

import { HighlightManager } from '../2d/basic/HighlightManager.class';
import { configProviders } from '../model/basic/Injector.class';

configProviders('root', {
  [Inferfaces.IImageManager]: HighlightManager,
  [Inferfaces.IGlobalConstManager]: HighlightManager,
});
