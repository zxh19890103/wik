import L from 'leaflet';
import { deco$$ } from '@/model';
import { boundToLatLngs, D2R, leafletOptions, mapLatLng } from '../utils';
import { createOffscreenCanvas } from '@/utils';
import { ReactiveLayer, ReactiveLayerMixin } from '@/mixins';
import { Constructor } from '@/interfaces';
import { DEFAULT_PATH_STYLE } from './constants';

export type ImageLayerDataSource = HTMLImageElement | HTMLCanvasElement;

@leafletOptions<L.PolylineOptions>({
  ...DEFAULT_PATH_STYLE,
  stroke: true,
  dashArray: [3, 4],
  fill: true,
  fillColor: '#f90',
})
export class ImageLayer extends deco$$
  .mix(L.Polygon)
  .with<L.Polygon, ReactiveLayer>(ReactiveLayerMixin) {
  protected image: ImageLayerDataSource = null;
  protected width = 0;
  protected height = 0;
  /**
   * If you need to draw bound.
   */
  protected needDrawBound = false;

  constructor(private imgSrc: string | ImageLayerDataSource, width: number, height: number) {
    const latlngs = [
      boundToLatLngs([
        [-height / 2, -width / 2],
        [height / 2, width / 2],
      ]),
    ];

    super(latlngs);

    this.width = width;
    this.height = height;

    this.latlngs = latlngs;

    // if user gives an image instance.
    if (imgSrc) {
      this.setImage(imgSrc);
    }

    if (!this.image) {
      this.image = this.__DEFAULT_IMAGE__ || null;
    }
  }

  setImage(imgSrc: string | ImageLayerDataSource, draw = false) {
    if (typeof imgSrc === 'string') {
      if (this.image instanceof Image && this.image?.src === imgSrc) return;
      this.imgSrc = imgSrc;
      this.image = new Image();
      this.image.src = imgSrc;
    } else {
      this.image = imgSrc;
    }

    if (!draw) return;

    if (this.image instanceof Image) {
      reqRedraw(this.image, this);
    } else {
      this.redraw();
    }
  }

  getImage(): ImageLayerDataSource {
    if (this.image) {
      return this.image;
    }

    return this.__DEFAULT_IMAGE__ || null;
  }

  showBounds(show = true) {
    this.needDrawBound = show;
    this.redraw();
  }

  onTransform(): void {
    this.setLatLngs(
      mapLatLng(
        this.latlngs,
        (latlng, _latlng) => {
          return this.localToWorld(latlng);
        },
        (this as any)._latlngs,
      ),
    );
  }

  /**
   * @see https://web.dev/canvas-performance/
   *
   * I cannot inspect the performance improvement
   */
  _updatePath() {
    if (this.needDrawBound) {
      this._renderer._updatePoly(this, true);
    }

    const image = this.getImage();
    if (!image) return;

    const ctx = this._renderer._ctx;

    const { max, min } = this._pxBounds;

    const tX = (0.5 + (max.x + min.x) / 2) << 0;
    const tY = (0.5 + (max.y + min.y) / 2) << 0;

    const size = this._map.project([-this.height, this.width]);

    const dW = (0.5 + size.x) << 0;
    const dH = (0.5 + size.y) << 0;

    const dX = (0.5 + -size.x / 2) << 0;
    const dY = (0.5 + -size.y / 2) << 0;

    const sW = image.width;
    const sH = image.height;

    ctx.save();
    ctx.translate(tX, tY);
    ctx.rotate(-(this.angle + this.anglePhase) * D2R);
    ctx.drawImage(image, 0, 0, sW, sH, dX, dY, dW, dH);
    ctx.restore();
  }
}

export interface ImageLayer {
  _renderer: L.Canvas;
  _pxBounds: L.Bounds;
  readonly __DEFAULT_IMAGE__: ImageLayerDataSource;
}

const redrawReqs: Map<HTMLImageElement, ImageLayer> = new Map();

function onImageLoad({ target }) {
  if (redrawReqs.has(target)) {
    const layer = redrawReqs.get(target);
    layer.redraw();
    redrawReqs.delete(target);
  }

  target.onload = null;
}

const reqRedraw = (image: HTMLImageElement, context: ImageLayer) => {
  redrawReqs.set(image, context);
  if (image.naturalWidth !== 0) {
    onImageLoad({ target: image });
    return;
  }
  image.onload = onImageLoad;
};

interface SetDefaultImageOptions {
  offscreenCanvas: boolean;
  scale: number;
}

export function setDefaultImage<T extends ImageLayer>(
  C: Constructor<T>,
  src: string,
  options: SetDefaultImageOptions = {
    offscreenCanvas: false,
    scale: 1,
  },
) {
  return new Promise((done) => {
    const img = new Image();

    img.onload = () => {
      if (options.offscreenCanvas) {
        C.prototype.__DEFAULT_IMAGE__ = createOffscreenCanvas(img, options.scale);
      } else {
        C.prototype.__DEFAULT_IMAGE__ = img;
      }

      img.onload = null;
      done(null);
    };

    img.src = src;
  });
}
