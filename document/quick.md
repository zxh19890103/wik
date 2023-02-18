---
layout: page
title: Quick
---

## Installation


You can use yarn or npm,

```sh

yarn add @zxh19890103/wik

# or npm

npm install @zxh19890103/wik

```

## Code & Run it.

In your project, define your `Warehouse` class.

```ts
import { wik, wikui } from '@zxh19890103/wik';

@wik.inject(...)
class MyWarehouse extends wikui.WikWarehouse {
  layout() {
    // this.create(...)
  }
}
```

To flush it on the screen, you create a React component.

```tsx
import { wik, wikui, wikdom } from '@zxh19890103/wik';

const App = () => {
  return <wikdom.World defaultKeys={["2d"]}>
    <wikdom.Warehouse key="2d" warehouse={MyWarehouse} />
  </wikdomWorld>;
};
```

That's all.