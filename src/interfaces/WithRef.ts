export interface WithRef<R = any> {
  /**
   * data which will be mount on layer to render.
   *
   * when you are too lazy to design a model (from Base), ref is the best alternative.
   *
   * all reactive layer is with ref.
   */
  $$ref: R;
}
