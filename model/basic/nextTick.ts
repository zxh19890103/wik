type NextTick = () => void;

let size = 0;
const queue: NextTick[] = [];

const nextTick = (fn: NextTick) => {
  queue.push(fn);
  size += 1;
};

const flushNextTicks = () => {
  if (size === 0) return;

  let fn = null;

  console.log('flush next ticks');

  while ((fn = queue.shift())) fn();

  size = 0;
};

export { nextTick, flushNextTicks };
