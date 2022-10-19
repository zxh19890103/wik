---
layout: page
title: 模型与视图的关系
order: 90
---

## 概览

业务模型，简称模型，它们持有全部的状态，并且拥有对状态做出变更的能力，最后以事件的方式告诉外界。

模型是看不见的，可视化要做的事情时将之以几何形状呈现在用户面前，而模型的变更也需要通过变更图形来让用户感知到。

视图也是一种模型，它连接的是数据对象和 GPU。但是视图只与显示相关，并无任何业务性质，大部分的可视化项目严重地涉及企业的业务。那么，要将公司的业务可视化，就需要连接业务模型和视图模型。

存在一种选择，将业务对象定义在视图模型上，这是可行的。但是它存在的缺陷在于，业务与视图是强绑定关系，因此无法平滑地切换视图。比如，要显示一个机器人，我们会使用 `Leaflet` 的 `SVGOverlay` 组件，因其具有丰富的细节。而 `SVGOverlay` 是性能瓶颈极低，为了满足大量机器人的显示要求，我们不得不回退到 `Circle` 方案。

问：要从 `SVGOverlay` 切换至 `Circle`，需要做哪些事？

当然，首先需要定义 `Circle` 的显示样式，然后将同样的业务逻辑**复制**过来。

显然，**复制**是不被允许的！

因此，将业务从显示分离出来是必要的，于是就有了一套业务模型和若干套视图模型。这样分离之后，我们可以很平滑的将显示从 2D 切换到 3D。

这并不是没有代价的，

- 我们需要定义一套视图接口层以抹平各种视图之间的 API 差异
- 视图更新必须由业务模型出发

WGUI 已经梳理好了一套标准流程，严格沿着这套流程实施你的代码，就可以得到意想不到的好处。现在，大概展示一下如何依流程完成一个简单的例子，分为以下几步：

1. 定义业务模型
2. 定义视图接口
3. 定义两个视图模型（为了展示切换的平滑）
4. 关联业务模型与视图

这里，我们以机器人为例。

## 定义业务模型

模型必须由 `Base` 扩展出来，其中 `@effect(KuboBotEffect.translate)` 的意思是业务模型的这个方法被调用之后，对应的视图也需要调用对应的方法，以保持模型和视图的一致，

```ts
import { Base } from '@fe/graphic/model';

enum KubotEffect {
  translate = 'Translate',
}

class Kubot extends Base<KubotEffect> {
  px: number = 0;
  py: number = 0;

  @effect(KubotEffect.translate)
  setPosition(x: number, y: number) {
    this.px = x;
    this.py = y;
  }
}
```

## 定义视图接口

```ts
import { View } from '@fe/graphic/model';

interface KubotView extends View<Kubot, KubotEffect> {
  whenTranslate(): void;
}
```

## 定义两个视图

```ts
import { Circle, SVGOverlay } from 'leaflet';

class Kubot1 extends Circle implements KubotView {
  model: Kubot;

  whenTranslate() {
    const { px, py } = this.model;
    this.setLatLng([py, px]);
  }

  whenInit() {
    const { px, py } = this.model;
    this.setLatLng([py, px]);
  }
}

class Kubot2 extends SVGOverlay implements KubotView {
  model: Kubot;

  private getBounds() {
    // computes bounds from this.model
    throw new Error('not implemented');
  }

  whenTranslate() {
    this.setBounds(this.getBounds());
  }

  whenInit() {
    this.setBounds(this.getBounds());
  }
}
```

## 调用

业务模型：

```ts
const bots = new List(hrModel.Robot, []);
```

视图模型：

```ts
const warehouse = rootInjector.$new(Warehouse);
```

连接业务模型和视图模型：

```ts
const modelViewMapping = {
  circle: (m) => new Kubot1(),
  overlay: (m) => new Kubot2(),
};
```

呈现：

```tsx
// presentation
const UI = () => {
  return (
    <Scene warehouse={warehouse}>
      <Warehouse modelViewMapping={modelViewMapping}>
        <ViewSet model={bots} type="circle" />
        <ViewSet model={bots} type="overlay" />
      </Warehouse>
    </Scene>
  );
};
```
