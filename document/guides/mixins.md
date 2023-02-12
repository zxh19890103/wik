---
layout: page
title: Mixins
categories: guide
---

以下是 wiki 上的定义：

> Mixins are a language concept that allows a programmer to inject some code into a class. Mixin programming is a style of software development, in which units of functionality are created in a class and then mixed in with other classes.

https://en.wikipedia.org/wiki/Mixin

混入能带来较继承更多的好处，维基上也有列出：

https://en.wikipedia.org/wiki/Mixin#Advantages

在 JavaScript 中，常见的混入方式为修改原型，它比较容易实现，但是存在一定的风险。Justin Fagnani 在博客 <a target="_blank" href="https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/ 
">"Real" Mixins with JavaScript Classes</a> 中提出了一种更安全的混入机制，它的基础是类的继承。

Wik 对这两种方式均有采用，基本的原则是，简单的混入使用*修改原型方式*，否则使用*继承的方式*。

## 修改原型

注意，这种方式只混入类的**方法成员**，这样可以简化问题。因为若要同时混入属性成员，就需要调用构造函数，这会增加代码的复杂度。

一个例子是`mixins/Emitter.ts`，首先定义一个类，建议类名以`Mix`结尾，

```ts
export abstract class EmitterMix implements WithParent<EmitterMix> {
  __super__: any;
  $$parent: EmitterMix;

  static event: WikEvent = null;

  noEmit = false;

  emit(event: string, payload: any) {
    // ...
  }
}
```

然后定义 TS 类型声明，这可以让混入更安全，同时也能带来 IDE 的*自动完成*和*建议提示*等好处，

```ts
export interface WithEmitter<E extends string> {
  /**
   * set it True, the follow emit will be ignore and then set it False.
   */
  noEmit: boolean;
  emit<T extends EventNames<E>>(event: T, payload?: AnyObject): boolean;
}
```

最后，使用这个 Mix，你可以使用内部提供的 mixin 装饰器，这样更直观，紧接着，你需要扩展混入目标类的类型，

```ts
@mixin(EmitterMix)
class Base {}

interface Base extends WithEmitter<string> {}
```

显然，EmitterMix 是有一个上下文的，这里是 EventEmitter3，它来自开源世界。所以，它的耦合性非常强，需要以下四个方面的配合：

1. 混入类
2. 混入类上下文
3. 混入类的类型声明
4. 目标类

## 继承

这种方式下，一个 mixin 被定义为：

> A mixin is an abstract subclass

即，一个抽象的子类。具体来说，mixin 是一个工厂函数：

```ts
type Mixin<B extends object, M> = (b: Constructor<B>) => Constructor<B & M>;
```

它接收一个类（JS 中当然就是一个构造函数），返回一个类。实现上，接收的这个类是父类，而返回的类由此继承得到。

一个例子，也是目前唯一的例子，是`mixins/ReactiveLayer.mixin.ts`，

首先，定义混入类的声明，建议在一个独立的文件中编写：

```ts
interface ReactiveLayer {
  position: L.LatLng;
  translate(lat: number, lng: number): void;
}
```

然后，实现对应的 Mix，也是建议独立文件编写，同时以追加`mixin`后缀作为文件名，实现类的类名以`Mixin`结尾，以表示它是`ReactiveLayer`的混入实现：

```ts
function ReactiveLayerMixin(B: Constructor<L.Layer>): Constructor<L.Layer & ReactiveLayer> {
  return class extends B implements ReactiveLayer {
    position: L.LatLng = null;

    translate(lat: number, lng: number) {}
  };
}
```

最后，使用它，拿`2d/basic/Circle.class.ts`为例，

```ts
class Circle extends mix(L.Circle).with<L.Circle, ReactiveLayer>(ReactiveLayerMixin) {}
```

其中`mix`是内部提供的函数，`mix`接收的是目标混入类，`ReactiveLayerMixin`是混入类，最后 `Circle` 是完成了混入逻辑的类。这样在使用 `Circle` 的时候就可以应用 `ReactiveLayer` 提供的增强特性：

```ts
const circle = new Circle([0, 0]);

circle.translate(1000, 6000);
```

## MIX 函数

mix 的实现比较简单，它本身的逻辑仅仅是切换混入上下文上绑定的目标混入类，

```ts
const context = { b: null, with: _with };

function mix(b) {
  context.b = b;
  return context;
}
```

实际起作用的逻辑在 \_with 函数中，

```ts
function _with(...mixins: Mixin[]) {
  return mixins.reduce((c, mixin) => {
    return mixin(c);
  }, this.b);
}
```

它使用了 reduce 函数对上下文中的 b 构造函数进行混入，返回的是最终混入了 mixins 的构造函数，其中构造函数也可以叫做“类”

这样的实现方式不过是为了使代码更可读。

## 处理类型

拿 `ReactiveLayer` 来说，`ReactiveLayerMixin` 的混入目标类是 `L.Layer` 及其全部子类。实现 `ReactiveLayerMixin` 的时候，我们绑定是 `L.Layer`，但是使用的时候，可能是 `L.Layer` 的子类。如何兼容这些情况呢？可以采取的办法是函数重载。事实上，我们需要枚举出全部的子类，

```ts
export function ReactiveLayerMixin(
  Base: Constructor<L.Layer>,
): Constructor<L.Layer & ReactiveLayer>;
export function ReactiveLayerMixin(Base: Constructor<L.Path>): Constructor<L.Path & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.Polyline>,
): Constructor<L.Polyline & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.Polygon>,
): Constructor<L.Polygon & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.Rectangle>,
): Constructor<L.Rectangle & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.Circle>,
): Constructor<L.Circle & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.CircleMarker>,
): Constructor<L.CircleMarker & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.Marker>,
): Constructor<L.Marker & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.SVGOverlay>,
): Constructor<L.SVGOverlay & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.ImageOverlay>,
): Constructor<L.ImageOverlay & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.DivOverlay>,
): Constructor<L.DivOverlay & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.VideoOverlay>,
): Constructor<L.VideoOverlay & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.Layer>,
): Constructor<L.Layer & ReactiveLayer>;
```

只有这样，TS 类型系统才会在用户使用混入的时候适配到正确的目标类，从而用户可以在继承类中访问到具体的成员。

## 总结

- 简单逻辑混入的时候，你可以采用原型修改的办法，但是需要四个方面的协调配合
- 复杂的混入，使用继承的方式更好，因为继承更不容易出错，而且你将获得诸多好处
- 实现一个继承式混入，你需要编写一个接口，接着枚举出全部的可混入的目标类以重载混入函数
