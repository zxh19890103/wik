import { mix } from '../../model/basic';
import { boundToLatLngs, leafletOptions, mapLatLng } from '../../utils';
import L from 'leaflet';
import { ReactiveLayer } from '../../mixins/ReactiveLayer';
import { ReactiveLayerMixin } from '../../mixins/ReactiveLayer.mixin';
import { D2R } from './constants';
import { Constructor } from '../../interfaces/Constructor';

@leafletOptions<L.PolylineOptions>({
  color: '#f80',
  stroke: true,
  dashArray: [3, 4],
  fill: true,
})
export class ImageLayer extends mix(L.Polygon).with<L.Polygon, ReactiveLayer>(ReactiveLayerMixin) {
  protected image: HTMLImageElement = null;
  protected width = 0;
  protected height = 0;
  protected isDrawingBounds = false;

  constructor(private imgSrc: string | HTMLImageElement, width: number, height: number) {
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
      this.image = (this.constructor as any).__default_image__ || null;
    }
  }

  override onAdd(map: L.Map): this {
    if (this.image !== null) {
      super.onAdd(map);
      return this;
    }

    if (!this.getImage()) {
      throw new Error('no src nor image given.');
    }

    super.onAdd(map);
    return this;
  }

  setImage(imgSrc: string | HTMLImageElement, draw = false) {
    if (typeof imgSrc === 'string') {
      // no need to assign.
      if (this.image?.src === imgSrc) return;
      this.imgSrc = imgSrc;
      this.image = new Image();
      this.image.src = imgSrc;
    } else {
      this.image = imgSrc;
    }

    if (draw) {
      reqRedraw(this.image, this);
    }
  }

  getImage() {
    if (this.image) {
      return this.image;
    }

    if ((this.constructor as any).__default_image__) {
      return (this.constructor as any).__default_image__;
    }

    return null;
  }

  showBounds(show = true) {
    this.isDrawingBounds = show;
    this.redraw();
  }

  onTransform(snapshot: any): void {
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

  _updatePath() {
    const ctx = this._renderer._ctx;
    const { max, min } = this._pxBounds;
    const cx = (max.x + min.x) / 2;
    const cy = (max.y + min.y) / 2;

    if (this.isDrawingBounds) {
      this._renderer._updatePoly(this, true);
    }

    // draw img
    const image = this.getImage();
    if (!image) return;

    const { x: sx, y: sy } = this._map.project([-this.height, this.width]);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-this.angle * D2R);
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, -sx / 2, -sy / 2, sx, sy);
    ctx.restore();
  }
}

export interface ImageLayer {
  _renderer: L.Canvas;
  _pxBounds: L.Bounds;
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

export function setDefaultImage<T extends ImageLayer>(C: Constructor<T>, src: string) {
  return new Promise((done) => {
    if ((C as any).__default_image__) {
      (C as any).__default_image__.src = src;
      return done(null);
    }

    const img = new Image();
    img.src = src;
    img.onload = done;
    (C as any).__default_image__ = img;
  });
}
