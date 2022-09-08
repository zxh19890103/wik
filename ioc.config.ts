import { injector } from './model/basic/inject';
import * as Inferfaces from './interfaces/symbols';

import { HighlightManager } from './2d/basic/HighlightManager.class';
import { AnimationManager } from './2d/animation/AnimationManager.class';
import { ImageManager } from './2d/basic/ImageManager.class';
import { PaneManager } from './2d/basic/PaneManager.class';
import { SelectionManager } from './2d/basic/SelectionManager.class';
import { InteractiveStateActionManager } from './mixins/InteractiveStateActionManager.class';
import { ModeManager } from './model/modes/ModeManager.class';
import { GlobalConstManager } from './model';

injector.bind(Inferfaces.IHighlightManager, HighlightManager);
injector.bind(Inferfaces.IAnimationManager, AnimationManager);
injector.bind(Inferfaces.IImageManager, ImageManager);
injector.bind(Inferfaces.IPaneManager, PaneManager);
injector.bind(Inferfaces.IStateActionManager, InteractiveStateActionManager);
injector.bind(Inferfaces.ISelectionManager, SelectionManager);
injector.bind(Inferfaces.IModeManager, ModeManager);
injector.bind(Inferfaces.IGlobalConstManager, GlobalConstManager);
