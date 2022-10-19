---
layout: page
title: 组件
order: 70
---

在 dom 目录下，我们提供了几个 React 组件和 Hooks，它们和 leaflet layer、WGUI model、ess 业务结合紧密，目的是给予用户快速构建 UI 的能力。

要查阅这些组件、Hooks 的具体 API，你可前往 API 页面并定位至相关模块，此文档主要对它们的组合使用加以说明。

- Scene
- Warehouse
- ViewSet
- View
- useEvented
- useLeafletEvented
- useSelection
- useMultipleSelection

## Scene

`Scene` 为你创建了一个 Map 以及用于 UI 呈现的 element，并将由外界输入的 warehouse 与之关联起来，从而让用户只关心 `Warehouse` 的 API 即可。

除了 `Scene` 组件本身，它还额外提供了以下组件：

- Layout
- SelectShell
- MultipleSelectShell

`Layout` 用于对视窗快速布局，默认地图主视区占据剩余空间。

`SelectShell` 用于响应元素的点击选择，当用户选择了一个元素的时候，其包裹的元素会被渲染，并且通过 model 属性注入当前选择的元素。

```tsx
const Detail = (props: LayerSelectProps) => {
  return <div>you've selected {props.model.layerId}</div>;
};

const Main = () => {
  return (
    <Scene.SelectShell>
      <Detail />
    </Scene.SelectShell>
  );
};
```

`MultipleSelectShell` 用于响应多选，当用户框选或者连续点选了一些元素，其包裹的组件会被渲染，用法与 `SelectShell` 类似。

## Warehouse

`Warehouse` 为用户提供一个上下文 `__warehouse_context__`，它作为 `ViewSet` 组件的父组件。它并不为用户创建 warehouse 实例，因此 warehouse 需要用户提供，默认 warehouse 从 `Scene` 组件传递下来。`Warehouse` 组件的一个必要属性是 `modelViewMapping`，它定义了模型到视图的映射，为视图创建提供策略。

```tsx
const modelViewMapping = {
  bot: (m: any, w: IWarehouse) => w.injector.$new(Bot2),
  dot: (m: any, w: IWarehouse) => new Dot([m.py, m.px]),
};
```

## ViewSet

为了查询效率和更好的抽象以及 leaflet 意义上的图层管理， 图形库对其所管理的元素都进行了分类和分层，其载体是 `LayerList`。`ViewSet` 组件就用于管理这些 `LayerList`，包括创建、与业务模型列表绑定。`ViewSet` 帮助你完成了元素的创建、添加和移除，至于元素自身的变化，需要“模型驱动”机制。

## View

`View` 不会向用户开放。`ViewSet` 内部会用到它，这里不作说明。

## Hooks

`useEvented` 适用于扩展了 `EventEmitter` 的子类，用于响应一个或者多个事件，响应的逻辑是刷新组件；

与 `useEvented` 类似，只不过 `useLeafletEvented` 适用于 `leaflet` 的 `L.Evented`。

`useSelection` 收集需要响应点击选择的组件，以在事件发生时刷新组件；

与 `useSelection` 类似，`useMultipleSelection` 用于响应多选事件，并返回选中的元素。

注意，`useSelection` 和 `useMultipleSelection` 并不能独立使用，你需要将 `SelectionContext` 挂载到 `React` 树上。
