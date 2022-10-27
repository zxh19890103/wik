---
layout: page
title: 依赖注入
order: 971
---

wiki 上对 DI 的定义是，

> In software engineering, dependency injection is a design pattern in which an object or function receives other objects or functions that it depends on. A form of inversion of control, dependency injection aims to separate the concerns of constructing objects and using them, leading to loosely coupled programs

https://en.wikipedia.org/wiki/Dependency_injection

它是一个设计模式，是控制反转的一种形式。它的目的是分离关注点，分离的是“构建”和“使用”，以达到解耦的效果。

百科同时也给出了这种设计模式的好处，

https://en.wikipedia.org/wiki/Dependency_injection#Advantages

Wik 自己实现了依赖注入，原理比较简单，后边会补充文档。这里仅对如何使用做出说明。

## 特性

- 注入的层级性
- 提供策略：构造、工厂、值
- 注入策略：构造参数、属性
- 注入的继承性

## 注入的层级性

受 <a target="_blank" href="https://angular.io/guide/hierarchical-dependency-injection">Angular</a> 启发，Wik 支持了此特性，目的是为了支持多库区功能。

层级针对的是服务容器（简称“容器”），即容器具有层级性，它形成了一个树结构，我们将容器封装进一个叫 `Injector` 的实现类中，因此可以说容器就是 `Injector` 实例。要将一个被注入目标类声明为一个容器，需要使用到 `provides` 装饰，

```ts
@injectable()
class MyLogger {}

@provides({
  [Symbol.for('ILogger')]: MyLogger,
})
class Warehouse {
  @inject(Symbol.for('ILogger'))
  logger: MyLogger;
}
```

这样，不同的 `Warehouse` 实例就会拥有自己的 `logger`，

```ts
const warehouse1 = rootInjector.$new(Warehouse);
const warehouse2 = rootInjector.$new(Warehouse);

console.log(warehouse1.logger === warehouse2.logger); // false
```

既是树，就会存在一个根节点，这里是 `rootInjector`。 `rootInjector` 的服务通过 `configProviders` 函数声明，

```ts
configProviders('root', {
  [Interfaces.IImageManager]: ImageManager,
  [Interfaces.IGlobalConstManager]: GlobalConstManager,
  [Interfaces.ILogger]: { useFactory: () => console },
});
```

层级关系通过 `Injector` 的 `$new` 方法建立，服务的查询通过 `parent` 字段回退，直到根节点。目前只有 `$new` 方法才会建立容器，属性注入直接继承当前绑定对象的容器，而不是创建新的，即使你使用了 `provides` 装饰。这是一个局限，使用的时候需要注意。

现在，我们修改 `MyLogger`，向其注入 `ImageManager`，

```ts
@injectable()
class MyLogger {
  @inject(Interfaces.IImageManager)
  imageMgr: IImageManager;
}
```

那么， `warehouse1.logger.imageMgr` 和 `warehouse2.logger.imageMgr` 将会是同一个，它们都来自根节点。

如果需要隔离服务，可以使用 `provides` 装饰器向 `Warehouse` 提供这个服务，

```ts
@provides({
  [Symbol.for('ILogger')]: MyLogger,
  [Interfaces.IImageManager]: ImageManager,
})
class Warehouse {
  @inject(Interfaces.ILogger)
  logger: MyLogger;
}
```

这样，`warehouse1.logger.imageMgr` 和 `warehouse2.logger.imageMgr` 是独立的实例。

根据我们的查询规则，`logger` 作为 `Warehouse` 子节点，其本身并不创建容器，而是直接使用 `Warehouse` 的容器，因此首先在 `Warehouse` 的容器中查询 `IImageManager` 这个服务。

## 提供策略：构造、工厂、值

最常见的提供策略是 `new` 关键字，以上面的 `MyLogger` 为例，你需要将 `MyLogger` 被标注为 `injectable`。这是必需的，否则我们不会为你构建服务。

```ts
@injectable()
class MyLogger {}

@provides({
  [Interfaces.ILogger]: MyLogger,
})
class Warehouse {}
```

也可以使用工厂策略，当然这脱离了注入系统，

```ts
@provides([
  {
    provide: Interfaces.ILogger,
    useFactory: () => new MyLogger(),
  },
])
class Warehouse {}
```

你还可以使用常量提供，同样这样的策略也脱离了注入系统，

```ts
@provides([
  {
    provide: Interfaces.ILogger,
    useValue: new MyLogger(),
  },
])
class Warehouse {}
```

## 注入策略：构造参数、属性

注入策略目前支持构造参数、属性两种。使用参数注入的时候，你需要在 class 层面添加注解，

```ts
@inject(Interfaces.ILogger)
class Warehouse {
  constructor(private logger: ILogger);
}
```

使用属性注入的时候，你需要对属性添加注解，

```ts
class Warehouse {
  @inject(Interfaces.ILogger)
  logger: ILogger;
}
```

## 注入的继承性

因为类本身具有继承性，Wik 也对注入做了继承性处理，

```ts
abstract class Warehouse {
  @inject(Interfaces.ILogger)
  logger: ILogger;
}

class EssWarehouse extends Warehouse {}

const warehouse = rootInjector.$new(EssWarehouse);

console.log(!!warehouse.logger); // true
```
