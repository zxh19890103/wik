import { Mix } from '@/interfaces';

export abstract class ClickCancelMix implements Mix, WithClickCancel {
  isClickEventFireCancelled: boolean;

  getMixOptions() {
    return {
      isClickEventFireCancelled: false,
    };
  }

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
