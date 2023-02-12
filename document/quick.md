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

Firstly, You should define your `Warehouse` class.

```ts
import { dom, o2d, model } from '@zxh19890103/wik';

class MyWarehouse extends o2d.EssWarehouse {
  layout() {
    // your code.
  }
}
```

To represent it on screen, you could choose `Scene` component.

```tsx
const App = () => {
  const [warehouse] = useState(() => {
    return model.basic.rootInjector.$new(MyWarehouse);
  });

  return <dom.Scene warehouse={warehouse} />;
};
```