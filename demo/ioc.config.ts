import { configProviders, GlobalConstManager, interfaces } from '@/model';
import { ImageManager } from '@/2d/state';

configProviders('root', {
  [interfaces.IImageManager]: ImageManager,
  [interfaces.IGlobalConstManager]: GlobalConstManager,
  [interfaces.ILogger]: { useFactory: () => console },
});
