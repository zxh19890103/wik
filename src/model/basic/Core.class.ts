import { EventEmitter } from 'eventemitter3';
import { EmitterMix, WithEmitter } from '@/model/basic/Emitter';
import { mixin, writeReadonlyProp } from './mixin';

@mixin(EmitterMix)
export abstract class Core<E extends string = string> extends EventEmitter<E> {
  assign(pairs: string | Record<string, any>, value?: any) {
    if (!pairs) return;

    if (typeof pairs === 'string') {
      if (value === undefined) return;
      this[pairs] = value;
    } else {
      for (const key in pairs) {
        this[key] = pairs[key];
      }
    }
  }

  readOnly<V = any>(key: string, value: V) {
    writeReadonlyProp(this, key, value);
  }
}

export interface Core<E extends string = string> extends WithEmitter<E> {}
