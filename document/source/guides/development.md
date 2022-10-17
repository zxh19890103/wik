---
layout: page
title: 开发
---

## 开发

本地运行：

```sh

git clone git@git.hairoutech.com:softwaregroup/frontend/common/graphic.git

cd graphic

git checkout dev

yarn

yarn dev

# lint

yarn lint

```

打包并发布：

```sh

yarn build

cd dist

# modify version firstly.
npm publish

```

文档：

```sh

yarn docg # short for documents generate.

# then enter password to login host.

```

---

## 单元测试

...
