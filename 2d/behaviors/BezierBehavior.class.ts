import L from 'leaflet';
import { ObjectType } from '../../model';
import { Behavior } from '../../model/behaviors';
import { randomInt } from '../../utils';
import { appendAnimation, RotationAnimation, TranslationAnimation } from '../animation';
import { BezierTranslationAnimation } from '../animation/BezierTranslationAnimation.class';
import { HrMap } from '../basic/Map.class';
import { Bot } from '../Bot.class';
import { Warehouse } from '../Warehouse.class';

export class BezierBehavior extends Behavior {
  constructor(private map: HrMap, private wh: Warehouse) {
    super();
  }

  override onLoad(): void {}

  override onUnload(): void {}

  private points: L.LatLngLiteral[] = [];

  private bezierPick = false;

  onNoopClick(evt: L.LeafletMouseEvent): void {
    const r = Math.random();

    if (this.bezierPick || r > 0.5) {
      this.bezierPick = true;
      this.points.push(evt.latlng);
      L.marker(evt.latlng).addTo(this.map);

      if (this.points.length === 3) {
        this.translateBezier();
        this.points = [];
        this.bezierPick = false;
      }
    } else if (r > 0.3) {
      this.translateLinear(evt);
    } else {
      this.rotate();
    }
  }

  private translateLinear(evt) {
    const bot = this.wh.first<Bot>(ObjectType.bot);
    appendAnimation.call(bot, new TranslationAnimation(bot, evt.latlng.lat, evt.latlng.lng));
  }

  private translateBezier() {
    const [p0, c1, c2] = this.points;
    const bot = this.wh.first<Bot>(ObjectType.bot);
    appendAnimation.call(bot, new BezierTranslationAnimation(bot, p0, c1, c2));
  }

  private rotate() {
    const bot = this.wh.first<Bot>(ObjectType.bot);
    const n123 = 0 ^ (Math.random() * 4);
    const toDeg = n123 * 90;
    appendAnimation.call(bot, new RotationAnimation(bot, toDeg));
  }
}
