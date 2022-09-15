

文档地址：http://172.20.8.54:82/

## 为什么有这个图形库

目前 ESS 监控的图形元素均使用 leaflet 原生图形库，无业务性封装。

而地图编辑器有所封装，但是所采取的 _rewrite prototype_ 的 mixin 机制带来 2 个问题：

1. 潜在的命名冲突风险
2. TS 类型声明混乱

另外设计方面，编辑器存在的缺陷在于：

1. 没有独立的业务模型
2. 行为模式设计不合理
3. 缺乏基于栈的图形状态管理

而对于监控来说，业务模型与视图的响应机制纯粹基于事件，导致代码逻辑不够清晰（到处是绑定 `on` 和解绑 `off`）。

当然也有可取的地方，监控的可取之处是：

1. 有独立的业务模型

编辑器的可取之处是：

1. 基于 React 组件的 SVGOverlay
2. 基于状态的视图更新机制

因此，仓库图形库想要解决这些问题并采纳其中可取的地方。并且，它要封装公司的业务，以使可开箱即用，同时争取将两个端的图形部分的代码统一。与之同时，仿真项目以及数字中台或有可用之处。

---

## 特点

### 业务模型驱动视图

业务模型的变更设计为被跟踪，那么对应的视图的对应函数会被调用

### 业务模型与图形分离

业务模型往往只有一份，但渲染办法会存在多种

### 基于状态的图形更新

自上而下更新，更能保证 state-UI 的一致性

### Leaflet - React 结合的 SVGOverlay

用 React 更新内容，用 Leaflet 增删

### 更规范的 mixin

参考：

<a href="https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/">"Real" Mixins with JavaScript Classes</a>

用继承实现 mixin

### 接口先于实现

接口就是规范、限制、规格、协议

### 依赖注入

参考：

<a href="https://zh.wikipedia.org/wiki/%E4%BE%9D%E8%B5%96%E6%B3%A8%E5%85%A5#:~:text=%E5%9C%A8%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E4%B8%AD%EF%BC%8C%E4%BE%9D%E8%B5%96,%E7%BB%99%E6%8E%A5%E6%94%B6%E6%96%B9%E7%9A%84%E8%BF%87%E7%A8%8B%E3%80%82"> 在软件工程中，依赖注入（dependency injection，缩写为 DI）是一种软件设计模式，也是实现控制反转的其中一种技术 </a>

该设计的目的是为了分离关注点，分离接收方和依赖，从而提供松耦合以及代码重用性。

### 良好的图形分类、分层管理

分层基于分类，分层仅限于 leaflet

### 基于栈的图形状态管理

用于实现鼠标悬停、选中等状态

### 对地图及地图元素行为相关代码的分离

提供了强大的交互扩展能力

---

## 相关文档

- <a href="/modules.html">hrGui</a>
- <a href="https://reactjs.org/docs/getting-started.html">react</a>
- <a href="https://leafletjs.com/reference.html">leaflet</a>
- <a href="https://threejs.org/docs/index.html">threeJs</a>
- <a href="https://doc.babylonjs.com/start">babylonJs</a>
- <a href="https://glmatrix.net/docs/">gl-matrix</a>
- <a href="https://github.com/primus/eventemitter3#readme">eventemitter3</a>
- <a href="https://typedoc.org/guides/overview/">typedoc</a>
- <a href="https://vitejs.dev/guide/">vite</a>

---

## 教程

- <a href="/pages/tutorials/mixins.html">自定义 Mixin 并使用它</a>
- <a href="/pages/tutorials/modes.html">自定义 Behavior 和 Mode 并注册它</a>
- <a href="/pages/tutorials/animation.html">自定义 Animation 并应用它</a>
- <a href="/pages/tutorials/model-view.html">业务模型与视图如何联动</a>
- <a href="/pages/tutorials/model-dom.html">业务模型如何与 DOM 联动</a>
- <a href="/pages/tutorials/react-svgoverlay.html">Leaflet - React SVGOverlay 如何工作</a>
- <a href="/pages/tutorials/inject.html">依赖注入的使用与实现逻辑</a>

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