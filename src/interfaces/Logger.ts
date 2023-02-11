export interface ILogger {
  log(...args): void;
  warn(...args): void;
  error(...args): void;
  time(label: string): void;
  timeEnd(label: string): void;
}
