export abstract class ClickCancelMix implements WithClickCancel {
  isObjClickEventCancelled: boolean;

  cancelObjClickEvent() {
    this.isObjClickEventCancelled = true;
    requestAnimationFrame(() => {
      this.isObjClickEventCancelled = false;
    });
  }
}

export interface WithClickCancel {
  isObjClickEventCancelled: boolean;
  cancelObjClickEvent(): void;
}
