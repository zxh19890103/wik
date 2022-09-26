import { IDisposable } from '../../interfaces/Disposable';
import { injectable } from '../../model/basic/inject';

@injectable()
export class ImageManager implements IDisposable {
  private pool: Record<string, HTMLImageElement> = {};
  private pool2: Record<string, HTMLCanvasElement> = {};

  private _load(src: string) {
    return new Promise((r, e) => {
      if (this.pool[src]) {
        return r(this.pool[src]);
      }

      const image = new Image();
      (image as any).__prom_r = r;
      (image as any).__prom_e = e;

      image.addEventListener('load', onImageLoad);
      image.addEventListener('error', onImageLoad);

      image.src = src;
      this.pool[src] = image;
    });
  }

  load(src: string, ...more: string[]) {
    return Promise.allSettled([src, ...more].map((s) => this._load(s)));
  }

  get(src: string) {
    if (!this.pool[src]) {
      return null;
    }
    return this.pool[src];
  }

  getOffscreenCanvas(src: string) {
    if (!this.pool[src]) {
      return null;
    }

    if (this.pool2[src]) {
      return this.pool2[src];
    }

    const canvas = this.createOffscreenCanvas(src);

    this.pool2[src] = canvas;

    return canvas;
  }

  private createOffscreenCanvas(src) {
    const img = this.pool[src];

    const cav = document.createElement('canvas');

    const w = img.naturalWidth;
    const h = img.naturalHeight;

    cav.width = w;
    cav.height = h;

    cav.width = img.width * devicePixelRatio;
    cav.height = img.height * devicePixelRatio;
    cav.style.width = img.width + 'px';
    cav.style.height = img.height + 'px';

    const ctx = cav.getContext('2d');

    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.drawImage(img, 0, 0, w, h, 0, 0, w, h);

    return cav;
  }

  dispose(): void {
    throw new Error('Method not implemented.');
  }
}

function onImageLoad(this: HTMLImageElement, e: Event) {
  switch (e.type) {
    case 'load': {
      (this as any).__prom_r();
      this.removeEventListener('load', onImageLoad);
      break;
    }
    case 'error': {
      (this as any).__prom_e();
      this.removeEventListener('error', onImageLoad);
      break;
    }
  }

  delete (this as any).__prom_r;
  delete (this as any).__prom_e;
}
