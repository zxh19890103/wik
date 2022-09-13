export enum ReactiveLayerRenderEffect {
  /**
   * 设置了 layer 的业务状态
   *
   * setLayerState
   */
  state = /*             */ 0b00000000000000100000000000,
  /**
   *
   * 来自它端的消息，
   *
   * fromJSONValue
   */
  json2 = /*             */ 0b00000000000000010000000000,
  /**
   * onAdd
   */
  init = /*             */ 0b00000000000000001000000000,
  /**
   * setPosition / translates
   */
  translate = /*             */ 0b00000000000000000100000000,
  /**
   * setAngle / rotates
   */
  rotate = /*           */ 0b00000000000000000010000000,
  /**
   * setScale...
   */
  scale = /*            */ 0b00000000000000000001000000,
  /**
   * ha
   */
  child = /*            */ 0b00000000000000000000100000,
  /**
   * setLocalLatLngs / setlocalBounds
   */
  shape = /*            */ 0b00000000000000000000010000,
  /**
   * svg Or rectange bound changed
   */
  size = /*             */ 0b00000000000000000000001000,
  /**
   * fromFormValue
   */
  form = /*             */ 0b00000000000000000000000100,
  /**
   * fromJSONValue
   */
  json = /*             */ 0b00000000000000000000000010,

  /**
   *
   */
  none = /*             */ 0b00000000000000000000000000,
}

/**
 * move,rotate,scale,shape,size
 */
export const TRANSFORM_EFFECT =
  ReactiveLayerRenderEffect.init |
  ReactiveLayerRenderEffect.translate |
  ReactiveLayerRenderEffect.rotate |
  ReactiveLayerRenderEffect.scale |
  ReactiveLayerRenderEffect.shape |
  ReactiveLayerRenderEffect.size;

/**
 * json,init,json2,form
 */
export const LAYER_DATA_UPDATE_EFFECTS =
  ReactiveLayerRenderEffect.json |
  ReactiveLayerRenderEffect.init |
  ReactiveLayerRenderEffect.json2 |
  ReactiveLayerRenderEffect.form |
  ReactiveLayerRenderEffect.state;

/**
 *transform,form,state
 */
export const MODEL_WS_UPDATE_EFFECT =
  TRANSFORM_EFFECT | ReactiveLayerRenderEffect.form | ReactiveLayerRenderEffect.state;
