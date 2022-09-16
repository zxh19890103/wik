interface Task {
  context?: any;
  args?: any[];
  /**
   * 对于相同 key 值的 task，视为同一个，仅仅更新字段
   */
  key: string;
  run: (...args) => void;
}

const tasks: Set<Task> = new Set();
const tasksIndex: Map<string, Task> = new Map();
let flushScheduled = false;
let flushing = false;

/**
 * 用于函数的异步调度
 */
export const quequeTask = (task: Task) => {
  if (flushing) return;

  if (tasksIndex.has(task.key)) {
    const t = tasksIndex.get(task.key);
    Object.assign(t, task);
    return;
  } else {
    tasks.add(task);
    tasksIndex.set(task.key, task);
  }

  if (flushScheduled) return;

  queueMicrotask(flush);
  flushScheduled = true;
};

const flush = () => {
  flushing = true;

  for (const task of tasks) {
    const { context, run, args } = task;
    if (args) run.call(context, ...args);
    else run.call(context);
  }

  tasks.clear();
  tasksIndex.clear();

  flushing = false;
  flushScheduled = false;
};
