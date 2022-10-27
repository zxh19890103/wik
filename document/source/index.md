---
layout: page
title: 简介
---

<div class="logo">
  <img class="logo-dark" src="/images/logo-dark.svg" />
  <img class="logo-light" src="/images/logo.svg" />
</div>

## 特点

<ul class="cards cards--x2">
  
  <li>
  
  **模型驱动视图** 业务模型包含了系统的数据与行为，视图是业务模型的一种视觉映射，业务模型的变化导致视图变化
  
  </li>
    <li>
  
  **视图自驱动** 视图的变化的原因始终为数据的变化，视图模型也可以携带数据

  </li>
    <li>
  
  **1 model => N views** 一个模型可以绑定多个视图

  </li>
    <li>
  
  **React-SVGOverlay** React 负责 svg 的内容更新，leaflet 负责 overlay 的增删

  </li>
    <li>
  
  **Real Mixin** 用继承的方式实现 mixin

  </li>
    <li>
  
  **依赖注入** 该设计的目的是为了分离关注点，分离接收方和依赖，从而提供松耦合以及代码重用性

  </li>
  <li>
  
  **自动分层管理** 分层基于分类，分层仅限于 leaflet

  </li>
  <li>
  
  **交互状态管理** 实现鼠标悬停、选中、高亮等状态，支持扩展

  </li>
  <li>
  
  **行为和模式** 提供了强大的交互扩展能力

  </li>
  
</ul>

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
2. 选择一个名字（Wik - 仓库图形库）
3. 完善指导手册文档
4. 完成快速入门文档
5. 完成首页内容
6. 将 typedoc 移入 document
7. 一句话介绍
8. 插入效果图或者跳转到一个可以运行一段实际的代码，让用户看到效果，类似 playground
