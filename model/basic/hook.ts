export enum HookFlag {
  before = 0b01,
  after = 0b10,
  both = 0b11,
}

export function hook(options: { flag: HookFlag }) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    descriptor.value = wrapHooks(target, propertyKey, options.flag);
  };
}

function wrapHooks(proto: any, method: string, flag: HookFlag) {
  const func = proto[method];

  if (!__PROD__) {
    if (!/^[a-z]/.test(method)) {
      throw new Error('method name should start with a lowercase alphabet.');
    }
  }

  const name = `${method[0].toUpperCase()}${method.slice(1)}`;
  const before = `before${name}`;
  const after = `after${name}`;
  const on = `on${name}`;

  return function (this: any, ...args: any[]) {
    let pass = true;
    if (HookFlag.before & flag && this[before]) {
      pass = this[before]();

      if (pass === false) return;
    }

    func.call(this, ...args);

    if (HookFlag.after & flag) {
      if (this[after]) this[after]();
      if (this[on]) this[on]();
    }
  };
}
