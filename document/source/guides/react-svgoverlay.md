---
layout: page
title: 介绍 React-SVGOverlay
order: 930
---

## 概览

`SVGOverlay` 是 leaflet 中 layer 的一种，它将 HTML 中的一个 svg 元素交给 leaflet 来管理，从而丰富了 leaflet 的展现方式，

```ts
const svg = document.querySelector('svg.robot');
const overlay = new L.SVGOverlay(
  svg,
  [
    [0, 0],
    [3000, 3000],
  ],
  {},
);
```

注意到 leaflet 并不关心 svg 里面的内容，我们可以通过对它的修改，来实现元素的动态呈现。当然，如果你的元素是静态的，`SVGOverlay` 就相当于`ImageOverlay`。

**修改**的办法当然多种多样，可以使用直接调用 dom api，也可以使用框架比如 vue 或者 react。简单起见，我们选择了 react。

因此，react-svgoverlay 的大体形式就是：

- leaflet 负责它的位置（drag）和大小（zoom）
- react 负责它的内容更新

## 四个部分

- ReactSVGOverlayAppServer
- ReactSVGOverlayApp
- SVGComponentFactory
- ReactSVGOverlay

它们的关系大概是这样，首先，`ReactSVGOverlayAppServer` 负责调用 `ReactDOM` 的 `render` 函数，渲染的根组件是 `ReactSVGOverlayApp`，`ReactSVGOverlayApp` 内部维护了一个 react 组件列表，这些 react 组件都是由 `SVGComponentFactory` 函数创建的。

每一个 `ReactSVGOverlay` 都会绑定一个 react 组件，当它被添加到 map 上，这个 react 组件就会传输到 `ReactSVGOverlayApp` 并得以实例化。

用代码示意如下，

```tsx
// 1. 定义一个 Svg 组件，即定义内容
const Svg = SVGComponentFactory(() => {
  return <path d="" />;
});

// 2. 定义一个 leaflet 组件，它与上面的 react 组件绑定
class Overlay extends ReactSVGOverlay {
  constructor() {
    super(Svg);
  }
}

// 3. 创建一个 react app，用于 svg 内容的渲染
new ReactSVGOverlayAppServer().boostrap(map, 'anyPane');
// means
// React.render(<ReactSVGOverlayApp />);

// 4. 实例化一个 overlay 组件，并添加到 map 上
// add to map.
map.addLayer(new Overlay());

// this add action leads to react re-redner for a new svg element added.
```

需要给定一个层名称（pane），而且不允许后期更新，这个层名称的作用在于明确 react 渲染的节点位置。

<div class="alert alert--warn">
你声明的这个 Pane 只能用于该种方式的渲染，不要同时使用 leaflet 的 vector 渲染或者往其中放置不受管理的元素
</div>

## SVGOverlayList

`SVGOverlayList` 封装了一些创建和绑定逻辑，让你集中精力于 react 组件和 leaflet 组件的编写。

```ts
const list = warehouse.injector.$new(SVGOverlayList);

list.add(new Overlay());
```

并且，Warehouse 的 `addList` 则对 `SVGOverlayList` 创建进行了封装，因此如果你需要一个 svgoverlay 层，只需要，

```ts
warehouse.addList('robot', { renderBy: 'overlay', pane: 'robotsPane' });
```

然后，尽管往 warehouse 中添加元素，

```ts
warehouse.add('robot', new RobotOverlay());
```

## 更新 ReactOverlay 的样式和状态

ReactOverlay 提供了以下两个方法来更新 svg 的内容，

- setSVGStyle
- setSVGData
