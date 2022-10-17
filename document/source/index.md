---
layout: page
title: 简介
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

## 相关文档

- <a href="https://reactjs.org/docs/getting-started.html">react</a>
- <a href="https://leafletjs.com/reference.html">leaflet</a>
- <a href="https://threejs.org/docs/index.html">threeJs</a>
- <a href="https://doc.babylonjs.com/start">babylonJs</a>
- <a href="https://glmatrix.net/docs/">gl-matrix</a>
- <a href="https://github.com/primus/eventemitter3#readme">eventemitter3</a>
- <a href="https://typedoc.org/guides/overview/">typedoc</a>
- <a href="https://vitejs.dev/guide/">vite</a>

## TODO

1. 选择一个网站图标
2. 选择一个名字（HRWGUI - 海柔仓库图形库）
3. 完善指导手册文档
4. 完成快速入门文档
5. 完成首页内容
6. 将 typedoc 移入 document
