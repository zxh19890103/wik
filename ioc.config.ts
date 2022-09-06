import { injector } from './model/basic/inject';
import * as Inferface from './interfaces/symbols';

import { HighlightManager } from './2d/basic/HighlightManager.class';
import { AnimationManager } from './2d/animation/AnimationManager.class';
import { ImageManager } from './2d/basic/ImageManager.class';
import { PaneManager } from './2d/basic/PaneManager.class';
import { SelectionManager } from './2d/basic/SelectionManager.class';
import { InteractiveStateActionManager } from './mixins/InteractiveStateActionManager.class';
import { ModeManager } from './model/modes/ModeManager.class';

injector.bind(Inferface.IHighlightManager, HighlightManager);
injector.bind(Inferface.IAnimationManager, AnimationManager);
injector.bind(Inferface.IImageManager, ImageManager);
injector.bind(Inferface.IPaneManager, PaneManager);
injector.bind(Inferface.IStateActionManager, InteractiveStateActionManager);
injector.bind(Inferface.ISelectionManager, SelectionManager);
injector.bind(Inferface.IModeManager, ModeManager);
