/**
 * try invoking a method named `name` on o's own.
 */
export const tryInvokingOwn = (o: object, name: string, ...args) => {
  if (!Object.hasOwn(o['__proto__'], name)) return;
  const caller = o[name];
  if (typeof caller !== 'function') return;
  caller.call(o, ...args);
};
