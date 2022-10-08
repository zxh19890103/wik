import { queueTask } from '../../utils';

/**
 *
 * Don't give class-property default value.
 *
 * @example
 *
 *  @prop - name
 *  // or gives it a default value:
 *  @prop - ('ronnie') name
 */
export function prop(...args: any[]): any {
  if (args.length === 3) {
    setClassProp(args[0], args[1]);
    return;
  }

  return (...args1: any[]) => {
    const [proto, name] = args1 as [object, string, PropertyDescriptor];
    setClassProp(proto, name, args[0]);
  };
}

function setClassProp(proto: any, name: string, defaultVal?: any) {
  if (Object.hasOwn(proto, name)) {
    return;
  }

  // define
  // name may be rewrite on inst, evan though you define it as an getter/setter.

  const cName = proto.constructor.name;

  Object.defineProperty(proto, name, {
    get: function (this: any) {
      return this[`#${name}`] || defaultVal;
    },
    set: function (this: any, v) {
      this[`#${name}`] = v;
      queueTask({
        key: `${cName}_prop_event_${name}`,
        run: () => {
          this.emit(name);
        },
      });
    },
  });
}
