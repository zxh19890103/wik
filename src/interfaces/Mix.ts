export interface Mix {
  /**
   * 设置 mix 的配置项目，返回的值会直接挂在被 Mixed 的原型上
   */
  getMixOptions(): Record<string, string | number | boolean>;
}

export interface MixConstructor {
  prototype: Mix;
  name: string;
}
