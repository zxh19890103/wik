---
layout: page
title: 快速入门
---

## 安装

因为依赖包在注册于私有仓，因此首先修改 registry，使用命令或者添加 `.npmrc` 文件，

```sh
npm config set registry = 'http://172.18.81.191:10000/'
```

```
registry = 'http://172.18.81.191:10000/'
```

然后安装，使用 yarn 或者 npm，

```sh

yarn add @fe/grahic

# or npm

npm install @fe/grahic

```

<div class="alert alert--info">
记得修改仓库地址
</div>

## 在项目中使用

首先你**必须**定义自己的仓库类，

```ts
import { dom, o2d, model } from '@fe/grahic';

class MyWarehouse extends o2d.EssWarehouse {
  layout() {
    // your code.
  }
}
```

使用 `Scene` 组件呈现，

```tsx
const App = () => {
  const [warehouse] = useState(() => {
    return model.basic.rootInjector.$new(MyWarehouse);
  });

  return <dom.Scene warehouse={warehouse} />;
};
```

<div class="alert alert--warn">
请不要进入到目录里面探寻，因为 WGUI 是以 esm 包格式输出的
</div>
