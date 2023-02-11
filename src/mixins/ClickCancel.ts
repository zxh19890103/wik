export abstract class ClickCancelMix implements WithClickCancel {
  isClickEventFireCancelled: boolean;

  cancelClickEventFire() {
    this.isClickEventFireCancelled = true;
    requestAnimationFrame(() => {
      this.isClickEventFireCancelled = false;
    });
  }
}

export interface WithClickCancel {
  isClickEventFireCancelled: boolean;
  cancelClickEventFire(): void;
}
