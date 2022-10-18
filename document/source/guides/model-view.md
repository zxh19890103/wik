---
layout: page
title: 模型与视图的关系
order: 90
---

## 定义业务模型

业务模型都基于 Base 扩展出来，比如要定一个机器人的业务模型：

```ts
import { Base } from '@fe/graphic/model';

enum KuboBotEffect {
  translate = 'Translate',
  rotate = 'Rotate',
  error = 'Error',
}

class KuboBot extends Base<KuboBotEffect> implements OnInput {
  px: number = 0;
  py: number = 0;
  theta: number = 0;
  errState: string = null;

  @effect(KuboBotEffect.translate)
  setPosition(x: number, y: number) {
    this.px = x;
    this.py = y;
  }

  @effect(KuboBotEffect.rotate)
  setTheta(theta: number) {
    this.theta = theta;
  }

  @effect(KuboBotEffect.error)
  setError(err: string) {
    this.errState = err;
  }
}
```

## 定义视图接口

```ts
import { View } from '@fe/graphic/model';

interface KoboBotView extends View<KuboBot, KuboBotEffect> {
  whenTranslate(): void;
  whenRotate(): void;
  whenError(): void;
}
```

## 定义视图

```ts
import { Circle } from '@fe/graphic/2d';

class KuboBotView2D extends Circle implements KoboBotView {
  whenTranslate() {
    this.setPosition([this.model.py, this.model.px]);
  }

  whenRotate() {
    this.setAngle(this.model.theta + 90);
  }

  whenError() {
    if (this.errState) {
      this.setStyle({ color: 'red' });
    } else {
      this.setStyle({ color: 'green' });
    }
  }

  whenInit() {
    this.setPosition(this.model.py, this.model.px);
    this.setAngle(this.model.theta);
  }
}
```

## 调用

```ts
// state
const bots = new List(hrModel.Robot, []);

// UI
const warehouse = new Warehouse();

new Views({
  source: bots,
  views: warehouse.bots,
  make: (m) => new KuboBotView2D(),
});

// mount & update
```
