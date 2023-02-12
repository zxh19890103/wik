---
layout: landing
pic: /assets/feature.png
---

## What it it?

Wik is a JavaScript Library for big-scale warehouse visualization. Both 2D and 3D are supported. With Wik, you could visualize the warehouse very easily.

## Features

<ul class="cards cards--x3">
  <li>
{% include card.html title="Model-Driven" text="Business models contain the data and behavior of the system, and views are a visual mapping of the business model. Changes in the business model result in changes in the view." %}
  </li>
    <li>
{% include card.html title="Data-Driven" text="The reason for the change of the view is always the change of the data, and the view model can also carry data." %}
  </li>
    <li>
{% include card.html title="1 Model => N Views" text="One model can be bound to multiple views." %}
  </li>
    <li>
{% include card.html title="React-SVGOverlay" text="React is responsible for updating the svg content, leaflet is responsible for adding and deleting overlay." %}
  </li>
    <li>
{% include card.html title="Real Mixin" text="Implements mixin using inheritance." %}
  </li>
    <li>
{% include card.html title="Dependency Injection" text="The goal of this design is to separate concerns, decouple the recipient and dependencies, thus providing loose coupling and code reuse." %}
  </li>
  <li>
{% include card.html title="Automatic Panes Management" text="Panes is based on categories and limited to leaflet only." %}
  </li>
  <li>
{% include card.html title="Interactive State Management" text="Implement mouse hover, selection, highlight, and other states, support for expansion." %}
  </li>
    <li>
{% include card.html title="Behavior & Mode" text="Provide powerful interactive expansion capabilities." %}
  </li>
</ul>

## Code Sample

```tsx
import * as wik from '@zxh/wik'

class MyWarehouse extends Warehouse {}

export default () => {
  const [warehouse] = useState(() => {
    return rootInjector.$new(MyWarehouse) as MyWarehouse;
  });

  return (
    <wik.World defaultKeys={['2d']}>
      <wik.Warehouse key="2d" modes warehouse={warehouse} />
      <wik.MultipleSelectShell w={400}>
        <Aside />
      </wik.MultipleSelectShell>
      <wik.SelectShell w={300}>
        <Aside2 />
      </wik.SelectShell>
    </wik.World>
  );
};
```

## Pictures

{% include figure.html image="/assets/images/snapshot.png" caption="More than 20000 packages rendered!" position="center" %}

{% include figure.html image="/assets/images/snapshot2.png" caption="Colorful packages render" position="center" %}

## Dependencies

- <a href="https://reactjs.org/docs/getting-started.html">react</a>
- <a href="https://leafletjs.com/reference.html">leaflet</a>
- <a href="https://threejs.org/docs/index.html">threeJs</a>
- <a href="https://doc.babylonjs.com/start">babylonJs</a>
- <a href="https://glmatrix.net/docs/">gl-matrix</a>
- <a href="https://github.com/primus/eventemitter3#readme">eventemitter3</a>
- <a href="https://typedoc.org/guides/overview/">typedoc</a>
- <a href="https://vitejs.dev/guide/">vite</a>
