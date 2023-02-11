export interface WithParent<P = any> {
  /**
   * The parent of event.
   *
   * List is a parent of Base or Layer.
   *
   * This field has the name $$parent declared, which keep consistent with /model/basic/Base.class
   */
  $$parent: P;
}
