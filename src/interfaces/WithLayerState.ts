export interface WithLayerState<S> {
  layerState: S;
  setLayerState(partial: Partial<S>): void;
}
