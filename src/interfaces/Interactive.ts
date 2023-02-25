import { ContextMenuItem } from './d';

export interface OnMouseOverOut<S = any> {
  /**
   *
   * @param data the event maybe
   */
  onHover(data?: any): S;
  onHovered?(): void;
  /**
   *
   * @param state the state onHover returns
   * @param data the event maybe
   */
  onUnHover(state?: S, data?: any): void;
  onUnHovered?(): void;
}

export interface OnSelect<S = any> {
  /**
   *
   * @param data the event maybe
   */
  onSelect(data?: any): S;
  onSelected?(): void;
  /**
   *
   * @param state the state onSelect returns
   * @param data the event maybe
   */
  onUnSelect(state?: S, data?: any): void;
  onUnSelected?(): void;
}

export interface OnHighlight<S = any> {
  /**
   *
   * @param data the event maybe
   */
  onHighlight(data?: any): S;
  onHighlighted?(): void;
  /**
   *
   * @param state the state onHightlight returns
   * @param data the even maybe
   */
  onUnHighlight(state?: S, data?: any): void;
  onUnHighlighted?(): void;
}

export interface OnClick {
  onClick(e?: unknown): void;
}

export interface OnDblClick {
  onDblClick(e?: unknown): void;
}

export interface OnDrag {
  onDragEnd(coord?: unknown): void;
  onDragStart(): void;
  onDragging(coord?: unknown): void;
}

export interface OnContextMenu<Key extends string = string> {
  onContextMenu(evt?: unknown): ContextMenuItem[];
  onContextMenuClick(key: Key): void | Promise<any>;
}

/**
 * - S1 is the state shape of OnSelect,
 * - S2 is the state shape of OnMouseOverOut
 * - S3 is the state shape of OnHighlight
 */
export interface OnInteractive<S1 = any, S2 = any, S3 = any>
  extends OnSelect<S1>,
    OnMouseOverOut<S2>,
    OnHighlight<S3>,
    OnClick,
    OnDblClick,
    OnDrag,
    OnContextMenu {}

export interface InteractiveExports {
  /**
   * run the render function again, it's a sync call, no post render call.
   */
  reRender(): void;
  /**
   * render the state syncronize
   */
  _syncRenderOnce: boolean;
  /**
   * a signal indicating whether the head state has changed.
   */
  _headStateHasChanged: boolean;
  /**
   * logs to record the state before calling onXX. It's data onXX returns.
   */
  _uiStateChangeLogs: any[];
}

export type PossibleUndoableInteractName = 'Hover' | 'Select' | 'Highlight';

export interface Interactive
  extends Partial<OnInteractive>,
    InteractiveExports,
    Record<`is${PossibleUndoableInteractName}ed`, boolean> {}

export type OnInteractName =
  | 'onClick'
  | 'onDblClick'
  | 'onDragEnd'
  | 'onDragStart'
  | 'onDragging'
  | 'onContextMenu'
  | `on${PossibleUndoableInteractName}`
  | `onUn${PossibleUndoableInteractName}`
  | `on${PossibleUndoableInteractName}ed`
  | `onUn${PossibleUndoableInteractName}ed`;
