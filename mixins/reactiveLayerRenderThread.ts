import { ReactiveLayer } from './ReactiveLayer';
import { ReactiveLayerRenderEffect, LAYER_DATA_UPDATE_EFFECTS, TRANSFORM_EFFECT } from './effects';

const __RENDER_REQUESTS__: ReactiveLayer[] = [];
const __RENDER_REQUEST_EFFECTS__: Map<string, ReactiveLayerRenderEffect> = new Map();

let isFlushScheduled = false;
/**
 * 当线程正在进行 render 的时候，appendLayerRenderReq 需要缓存请求，然后等待下一轮微任务执行
 */
let isRendering = false;

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

  __RENDER_REQUESTS__.push(context);

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
    const effect = __RENDER_REQUEST_EFFECTS__.get(item.layerId);
    const snapshot = item.getSnapshot();

    item.onRender && item.onRender(effect);

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

    if (effect & LAYER_DATA_UPDATE_EFFECTS) {
      item.onLayerUpdate && item.onLayerUpdate(snapshot);
    }

    if (effect & ReactiveLayerRenderEffect.state) {
      item.onLayerStateUpdate && item.onLayerStateUpdate(snapshot?.state);
    }

    if (effect & ReactiveLayerRenderEffect.init) {
      item.onInit && item.onInit();
    }
  }

  isRendering = false;

  // After render
  setTimeout(() => {
    let item: ReactiveLayer = null;
    while ((item = __RENDER_REQUESTS__.shift())) {
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
        layer.fire('rotate', {});
      }

      item.afterRender && item.afterRender(effect);

      __RENDER_REQUEST_EFFECTS__.delete(id);
    }
  }, 10);

  isFlushScheduled = false;
};

export { appendLayerRenderReq };
