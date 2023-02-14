import { IDisposable } from '@/interfaces/Disposable';
import { injectable } from '@/model';
import { createOffscreenCanvas } from '@/utils';

@injectable()
export class ImageManager implements IDisposable {
  private images: Record<string, HTMLImageElement> = {};
  private offscreencanvases: Record<string, HTMLCanvasElement> = {};

  private _load(src: string) {
    return new Promise((r, e) => {
      if (this.images[src]) {
        return r(this.images[src]);
      }

      const image = new Image();
      (image as any).__prom_r = r;
      (image as any).__prom_e = e;

      image.addEventListener('load', onImageLoad);
      image.addEventListener('error', onImageLoad);

      image.src = src;
      this.images[src] = image;
    });
  }

  load(src: string, ...more: string[]) {
    return Promise.allSettled([src, ...more].map((s) => this._load(s)));
  }

  get(src: string) {
    if (!this.images[src]) {
      return null;
    }
    return this.images[src];
  }

  getOffscreenCanvas(src: string, scale = 1) {
    if (!this.images[src]) {
      return null;
    }

    if (this.offscreencanvases[src]) {
      return this.offscreencanvases[src];
    }

    const canvas = createOffscreenCanvas(this.images[src], scale);

    this.offscreencanvases[src] = canvas;

    return canvas;
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
