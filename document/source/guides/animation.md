---
layout: page
title: 动画
order: 940
---

动画是 layer 的状态从 A 变迁到 B 的过程连续性呈现。

CSS 中的 animation 被定义为几个关键帧加上对元素的动画设定，

```css
@keyframes slide-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.div {
  animation: slide-in 0.3s linear 3ms;
}
```

WGUI 与之类似，我们将一个动画以 class 的方式描述出来，然后交由 `AnimationManager` 来调度，`AnimationManager` 调度的基础是 `requestAnimationFrame`。

## 基类

`Animation` 基类在 2d/animation 下，它接收一个动画主体 `WithAnimate` 和一个 `value`，`value` 是主体将要达到的状态。`Animation` 包含了动画持续时长 `timing` 以及 `delta` 或者切片数 `N` 的计算逻辑，不管怎样的形式的状态描述，我们总有**办法**将变化计算为这两个数字。

## 动画调度

`AnimationManager` 并不神秘，在一个循环函数中，它遍历添加进来的动画请求列表，调用它们的 `run` 方法，直到 `timeout`，将主体置于终态。这个循环函数由 `requestAnimationFrame` 调用，每次循环结束，我们会清理掉过期的项目。如果，动画请求数为 `0`，循环就会停止。

```ts
const loop = () => {
  requestAnimationFrame(loop);

  for (const animation of animtions) {
    if (animation.timeout()) continue;
    animation.run();
  }

  clean(animations);
};
```

## 自定义动画

定义一个动画，就是通过动画基类扩展实现的，主要实现其三个方法：

- start 初始化 - 一般计算出 `N` 或者 `duration` 和 `delta`
- run 过程计算
- final 终态设置

```ts
class OpacityAnimation extends HrAnimation {
  start() {
    this.N = 100;
  }

  run(elapse: number) {
    // set opacity = ...
  }

  final() {
    // set opacity = value
  }
}
```

然后，执行 `OpacityAnimation` ，我们使用 `appendAnimation` 这个函数，

```ts
appendAnimation.call(layer, new OpacityAnimation(layer, 0));
```

<div class="alert alert--warn">
注意，其中 layer 必须是 WithAnimate
</div>

## WGUI 提供的动画

- RotationAnimation
- TranslationAnimation
- BezierTranslationAnimation
