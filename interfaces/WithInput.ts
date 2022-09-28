export interface WithInput<D = any> {
  /**
   * intial data mode will receive
   */
  onInitInput?(data: D): void;
  /**
   * The data model will receive
   */
  onInput(data: D): void;
}
