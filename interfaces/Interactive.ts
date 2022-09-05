import { ContextMenuItem } from './types';

export interface OnMouseOverOut<S = any> {
  onHover(): S;
  onUnHover(state?: S): void;
}

export interface OnSelect<S = any> {
  onSelect(): S;
  onUnSelect(state?: S): void;
}

export interface OnClick {
  onClick(e?: L.LeafletMouseEvent): void;
}

export interface OnDblClick {
  onDblClick(e?: L.LeafletMouseEvent): void;
}

export interface OnDrag {
  onDragEnd(e?: L.LeafletMouseEvent, latlng?: L.LatLng): void;
  onDragStart(e?: L.LeafletMouseEvent): void;
  onDragging(e?: L.LeafletMouseEvent, latlng?: L.LatLng): void;
}

export interface OnHighlight<S = any> {
  onHighlight(): S;
  onUnHighlight(state?: S): void;
}

export interface OnContextMenu<Key extends string = string> {
  onContextMenu(evt?: L.LeafletMouseEvent): ContextMenuItem[];
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

export interface Interactive extends Partial<OnInteractive> {
  changeHistory: any[];

  /**
   * If it is in state of being selected.
   */
  isSelected: boolean;
  /**
   * If it is in state of being highlight.
   */
  isHighlight: boolean;
  /**
   * if it is in state of being mouse over.
   */
  isHover: boolean;
}

export type OnInteractName =
  | 'onClick'
  | 'onDblClick'
  | 'onHover'
  | 'onUnHover'
  | 'onSelect'
  | 'onUnSelect'
  | 'onDragEnd'
  | 'onDragStart'
  | 'onDragging'
  | 'onHighlight'
  | 'onUnHighlight'
  | 'onContextMenu';
