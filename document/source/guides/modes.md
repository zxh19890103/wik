---
layout: page
title: 行为与模式
order: 970
---

## 概览

行为其实是应用对 leaflet 各种类型的事件的响应，主要有两类：

- 鼠标事件
- 键盘事件

模式定义为*一些行为的集合*，比如在“只读”模式下，元素被点击后不会有任何效果；而在“编辑”模式下，元素会被选中并且弹出缩放和旋转按钮。

将行为抽离，由模式收集起来，最后注册到系统中，这样的做法利于代码的管理，同时应用变得可扩展。

## 行为

WGUI 的行为可分为两类，一类是针对元素(item)的，另一类是针对地图画布(map)的。它们都会对应到“行为”的某个方法上，

| type | event       | callback      |
| ---- | ----------- | ------------- |
| item | click       | onClick       |
| item | dblclick    | onDblClick    |
| item | mousedown   | onPress       |
| item | mouseover   | onHover       |
| item | mouseout    | onUnHover     |
| item | contextmenu | onContextMenu |
| map  | click       | onNoopClick   |
| map  | mousedown   | onMouseDown   |
| map  | mousemove   | onMouseMove   |
| map  | mouseup     | onMouseUp     |

我们对行为的接口声明是这样的：

```ts
interface IBehavior {
  onLoad(): void;
  onUnload(): void;

  onHover(obj: GraphicObject, evt: unknown): void;
  onUnHover(obj: GraphicObject, evt: unknown): void;
  onClick(obj: GraphicObject, evt: unknown): void;
  onDblClick(obj: GraphicObject, evt: unknown): void;
  onPress(obj: GraphicObject, evt: unknown): void;
  onContextMenu(obj: GraphicObject, evt: unknown): void;

  onMouseDown(evt: unknown): void;
  onMouseMove(evt: unknown): void;
  onMouseUp(evt: unknown): void;
  onNoopClick(evt: unknown): void;
}
```

## 模式

模式是行为的集合，如果一个系统注册了多个模式，那么当前只能有一个模式生效，

```ts
interface IMode {
  name: string;
  behaviors: IBehavior[];
  modeMgr: IModeManager;
  load(): void;
  unload(): void;
  onLoad(): void;
  onUnload(): void;
}
```

## 在 Warehouse 中使用模式

`IModeManager` 用于管理模式，其 `apply` 方法意为调用当前模式下全部行为的指定回调函数，每一个 `Warehouse` 实例都会注入一个独立的 `modeManager`，`Warehouse` 会监听 `map` 的事件，以调用 `modeManager` 的 `apply` 方法作为响应，

```ts
interface IModeManager {
  apply(callback: BehaviorCallback, ...args: any[]): void;
}

// under the warehouse context.
this.map.on('mousedown', (e) => {
  this.modeManager.apply('onMouseDown', e);
});
```

可以使用 `IModeManager.create` 快速创建一个模式，

```ts
interface IModeManager {
  create(name: string, ...behaviors: IBehavior[]): void;
}
```

<div class="alert alert--warn">
注意，模式的名字非常关键，不要重复。
</div>
