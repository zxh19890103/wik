import { ReactiveLayer } from './ReactiveLayer';
import { ReactiveLayerRenderEffect, TRANSFORM_EFFECT } from './effects';
import { WithSnapshot } from '../model/basic/Snapshot';

const __RENDER_REQUESTS__: Set<ReactiveLayer> = new Set();
const __RENDER_REQUEST_EFFECTS__: Map<string, ReactiveLayerRenderEffect> = new Map();
const __MIN__ = Math.ceil(1000 / 16); // 1 / 16 s

let isFlushScheduled = false;
/**
 * 当线程正在进行 render 的时候，appendLayerRenderReq 需要缓存请求，然后等待下一轮微任务执行
 */
let isRendering = false;
let postRenderSchedule: NodeJS.Timeout = null;
let lastFlushCallAt: number = null;

const appendLayerRenderReq = (context: ReactiveLayer, effect: ReactiveLayerRenderEffect) => {
  if (isRendering) {
    console.warn(
      '[appendLayerRenderReq] While rendering, new request of render cannot be appended.',
    );
    return;
  }

  const id = context.layerId;

  if (__RENDER_REQUEST_EFFECTS__.has(id)) {
    const currEff = __RENDER_REQUEST_EFFECTS__.get(id);
    __RENDER_REQUEST_EFFECTS__.set(id, currEff | effect);
    return;
  } else {
    __RENDER_REQUEST_EFFECTS__.set(id, effect);
  }

  context._isRenderScheduled = true;
  __RENDER_REQUESTS__.add(context);

  // one cycle, one task.
  if (isFlushScheduled) return;

  // it's idle, bootstrap it.
  queueMicrotask(flush);
  isFlushScheduled = true;
};

const flush = () => {
  isRendering = true;

  // Before render & During render
  for (const item of __RENDER_REQUESTS__) {
    item._isRenderScheduled = false;
    render(item, __RENDER_REQUEST_EFFECTS__.get(item.layerId));
  }

  isRendering = false;
  isFlushScheduled = false;

  const now = performance.now();

  if (lastFlushCallAt === null || now - lastFlushCallAt > __MIN__) {
    /**
     * If there's a schedule, we cancel it firstly, and then schdule a new plan for post rendering.
     */
    if (postRenderSchedule) clearTimeout(postRenderSchedule);
    postRenderSchedule = setTimeout(afterFlush, 10);
  } else {
    // Just clear the reqs. no post render.
    __RENDER_REQUESTS__.clear();
    __RENDER_REQUEST_EFFECTS__.clear();
  }

  lastFlushCallAt = now;
};

const render = (item: ReactiveLayer, effect: ReactiveLayerRenderEffect) => {
  const asWithSnap = item as unknown as WithSnapshot;
  const snapshot = asWithSnap.getSnapshot ? asWithSnap.getSnapshot() : null;

  // do render.
  item.leafletRender();

  item.onRender && item.onRender(effect);

  if (effect & ReactiveLayerRenderEffect.init) {
    item.onInit && item.onInit();
  }

  if (effect & ReactiveLayerRenderEffect.state) {
    item.onLayerStateUpdate && item.onLayerStateUpdate(snapshot?.state);
  }

  if (effect & TRANSFORM_EFFECT) {
    item.onTransform && item.onTransform(snapshot);
  }

  if (effect & ReactiveLayerRenderEffect.translate) {
    item.onTranslate && item.onTranslate(snapshot?.position);
  }

  if (effect & ReactiveLayerRenderEffect.rotate) {
    item.onRotate && item.onRotate(snapshot?.angle);
  }

  if (effect & ReactiveLayerRenderEffect.scale) {
    item.onScale && item.onScale(snapshot?.scale);
  }

  if (effect & ReactiveLayerRenderEffect.shape) {
    item.onShapeUpdate && item.onShapeUpdate(snapshot?.latlngs);
  }

  if (item._immediatelyRenderOnce) return;

  item._lastRenderedEffect = effect;
  item._headStateHasChanged = true;
};

const reRender = (item: ReactiveLayer) => {
  if (!item._lastRenderedEffect) return;

  render(item, item._lastRenderedEffect);
};

const afterFlush = () => {
  for (const item of __RENDER_REQUESTS__) {
    const id = item.layerId;

    const effect = __RENDER_REQUEST_EFFECTS__.get(id);

    const layer = item as unknown as L.Layer;

    if (effect & ReactiveLayerRenderEffect.state) {
      layer.fire('layerstate', {});
    }

    if (effect & ReactiveLayerRenderEffect.translate) {
      layer.fire('position', {});
    }

    if (effect & ReactiveLayerRenderEffect.rotate) {
      layer.fire('angle', {});
    }

    item.afterRender && item.afterRender(effect);

    __RENDER_REQUEST_EFFECTS__.delete(id);
  }

  __RENDER_REQUESTS__.clear();
  __RENDER_REQUEST_EFFECTS__.clear();

  postRenderSchedule = null;
};

export {
  appendLayerRenderReq,
  reRender as reactiveLayerReRenderFn,
  render as reactiveLayerRenderFn,
};
