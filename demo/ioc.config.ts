import * as Interfaces from '../src/interfaces/symbols';

import { GlobalConstManager } from '../src/model/state/GlobalConstManager.class';
import { configProviders } from '../src/model/basic/Injector.class';
import { ImageManager } from '../src/2d/state';

configProviders('root', {
  [Interfaces.IImageManager]: ImageManager,
  [Interfaces.IGlobalConstManager]: GlobalConstManager,
  [Interfaces.ILogger]: { useFactory: () => console },
});
