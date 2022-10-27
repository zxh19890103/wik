---
layout: page
title: 撤销与恢复
order: 965
---

## 概览

撤销与恢复功能在编辑类软件中举足轻重，它允许用户纠正错误操作以及顺应其反复变化的思想流。

在软件对这个问题的实践上，我们一般会使用 command 设计模式，其思路大概是，

首先，定义出全部的 command，比如 addCommand、removeCommand，每一个 command 都有“执行”和“撤销”逻辑；然后，定义一个 stack 来管理 command 实例，stack 可以 push（执行），可以 pop（撤销）。

command 可以实现序列化逻辑，使用户端能够持久化其操作。

Wik 将这些命令命名为 `StateAction` ，类似 react 对 action 的定义，action 里执行的是系统副作用。

https://refactoring.guru/design-patterns/command

## IStateAction

`IStateAction` 声明为如下：

```ts
interface IStateAction {
  readonly tag: number;
  readonly isRedo: number;
  apply(): void;
  revert(): void;
}
```

其中 `tag` 是时间戳，用于删除任意历史记录，一个 `Action` 可以被多次执行， `isRedo` 表示的就是其被执行的次数。

## IStateActionManager

`IStateActionManager` 的结构如下：

```ts
interface IStateActionManager {
  push(...args: any[]): this;
  pop(...args: any[]): this;
  delete(tag: number): this;
}
```

实现了 `IStateActionManager` 类有，

1. InteractiveStateActionManager
2. StateActionManager

其中， `InteractiveStateActionManager` 负责的是 layer 的交互状态管理，比如 hover 和选中以及高亮等。 `StateActionManager` 被用于应用级别的 undo-redo 实现。

## 例子

见 `demo/redo-undo.tsx`
