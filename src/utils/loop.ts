type LoopFn = (elapse: number, n: number) => void | number;
type LoopOptions = { duration?: number; auto?: boolean; delay?: number };

enum LoopPhase {
  init = 10,
  start = 20,
  tick = 30,
  stop = 40,
  stopped = 50,
}

const defaultOptions: LoopOptions = {
  duration: 1000,
  auto: true,
  delay: 3000,
};

export const loop = (fn: LoopFn, _options: LoopOptions = defaultOptions) => {
  const options = { ...defaultOptions, ..._options };
  let n = 0;
  let t = performance.now();
  let phase: LoopPhase = LoopPhase.init;

  const tick = () => {
    switch (phase) {
      case LoopPhase.stop: {
        phase = LoopPhase.stopped;
        return;
      }
      case LoopPhase.start: {
        phase = LoopPhase.tick;
        break;
      }
    }

    setTimeout(tick, options.duration);

    const now = performance.now();
    const r = fn(now - t, n++);
    if (r === 1) stop();
    t = now;
  };

  const stop = () => {
    if (phase !== LoopPhase.tick) return;
    phase = LoopPhase.stop;
  };

  const start = () => {
    if (phase === LoopPhase.start || phase === LoopPhase.stop) return;
    phase = LoopPhase.start;
    if (options.delay === 0) tick();
    else setTimeout(tick, options.delay);
  };

  if (options.auto) {
    start();
  }

  return {
    stop,
    start,
  };
};
