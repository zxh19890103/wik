import * as Interfaces from '@/model/symbols';
import { GlobalConstManager } from '@/model/state';
import { configProviders } from '@/model/basic/Injector.class';
import { ImageManager } from '@/2d/state';

configProviders('root', {
  [Interfaces.IImageManager]: ImageManager,
  [Interfaces.IGlobalConstManager]: GlobalConstManager,
  [Interfaces.ILogger]: { useFactory: () => console },
});
