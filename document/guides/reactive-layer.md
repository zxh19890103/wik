---
layout: page
title: Introducation to Reactive Layer
categories: guide
---

`ReactiveLayer` 是对 Leaflet 提供增强特性的 Mixin，它补充了以下功能：

- 可组成“树”
- 支持“树”的旋转、平移、缩放变换
- 基于状态的更新
- 更新合并

## 使用

我们提供了 `ReactiveLayerMixin` 这个 Mixin，在 `2d/basic` 和这个目录下，我们对 Leaflet 的全部 Layer 类进行了覆盖，你可以使用。如果要自己使用这个 Mixin，可以查看相关的代码，

```ts
class Circle extends mix(L.Circle).with<L.Circle, ReactiveLayer>(ReactiveLayerMixin) {
  constructor(latlng: L.LatLngExpression, options?: L.CircleMarkerOptions) {
    super(latlng, options);
    this.position = L.latLng(latlng);
  }
}
```

## 树结构及其变换

相关的 API 是：`addChild`、`removeChild`、`$$system`、`$$subSystems`。

<div class="alert alert--info">
之所以叫 system，subSystem，是因为 parent 和 children 用于其它方面；system 更贴切。
</div>

树结构的用途在于组织复合图形，结合我们公司的业务来说，“工作站”和“输送线”就需要用复合图形表示。

“工作站”由若干部分组成，每一个部分的表现形式不同，但部分始终依附于“工作站”这个整体概念。因此，当“工作站”从地图上被移除或添加，就意味着所有的“部分”也要被移除或添加。同样，工作站具备位置和角度属性，因此，你可以很方便地对“工作站”整体进行旋转和平移。

为了避免重复劳动，`2d/basic` 目录下的 `Group` 组件已经帮助你实现了几乎全部的事件响应逻辑，因此如果遇到复合图形，你可以直接使用 `Group`。

```ts
const group = warehouse.injector.$new(Group);

warehouse.addGroup(group);

const circle = new Circle([1000, 3000]);
const circle1 = new Circle([3000, 1000]);
const circle2 = new Circle([0, 0]);

group.addChild(circle, circle1, circle2);

group.translate(3000, 5000);
group.rotate(90);
group.scales(0.618);
```

## 视图的更新

视图的更新需要借助一些 API，比如 `translate`、`rotate`，它更改了 layer 的内部状态，但没有立即调用 leaflet 的 `redraw` 逻辑。Wik 按照以下流程执行更新：

1.  同步地修改 layer 的状态，比如 `position`、`angle`、`state` 等
2.  使用 `appendLayerRenderReq` 发起一个更新请求，`appendLayerRenderReq` 会以 layer 为键，收集当前循环中的更新，以 `EffectTag` 的方式记录更新的类型和 payload
3.  使用 `queueMicrotask` 发起一个微任务，开始处理全部的请求，根据记录的 `EffectTag` 由条件地执行以下钩子：

    - onRender (always)
    - onTransform
    - onTranslate
    - onRotate
    - onScale
    - onShapeUpdate
    - onLayerUpdate
    - onLayerStateUpdate
    - onInit

4.  使用 `setTimeout` 发起一个宏任务，调用 `afterRender` 钩子，有条件的 fire 三个事件：

    - layerstate
    - position
    - angle

5.  删除收集的更新请求

## 状态变化导致的渲染

你可以使用 `layerState` 为 layer 补充业务数据，然后通过调用 `setLayerState` 修改数据以更新视图。在 `onRender` 函数中读取 `layerState` 作为渲染的原因。 `onLayerStateUpdate` 和 `afterRender` 也可以用于状态渲染，但它们更有针对性，`onLayerStateUpdate` 最好用于 `onRender` 的修正，而 `afterRender` 最好不要涉及渲染。

站在 `ReactiveLayer` 的角度看“渲染”二字，其含义其实就是“leaflet API 调用”。

另外，我们提供的 `WithLayerState` 这个高阶类型，

```ts
class Dot extends Circle {
  layerState = {
    type: 1,
  };

  onRender() {
    const { type } = this.layerState;
    this.setStyle({ color: getColorByType(type) });
  }
}

interface Dot extends WithLayerState<{ type: number }> {}
```

## EffectTag

`EffectTag` 用于标记本次更新请求的类型。在一次循环中，针对某一 layer 的相同类型的更新请求只会触发一次更新动作，不同的 tag 会导致对应的钩子被调用。

```ts
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
```
