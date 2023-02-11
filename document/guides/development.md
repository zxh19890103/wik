---
layout: page
title: 开发
categories: guide
---

## 开发

拉取代码：

```sh
git clone https://github.com/graphic.git

cd graphic

git checkout dev
```

安装依赖、运行：

```sh

yarn

yarn dev

```

打包、发布：

```sh
# lint
yarn lint


# important, check type firstly.
yarn tsCheck

yarn build

cd dist

# this'll modify version firstly.
npm publish

```

文档：

```sh

yarn doc:dev # if you want write documentations.

yarn doc:gen # short for documents generate. it'll generate both hexo and typedoc.
# then enter password to login host.
```

---

## 单元测试

使用 vitest 写单元测试，

https://vitest.dev/guide/
