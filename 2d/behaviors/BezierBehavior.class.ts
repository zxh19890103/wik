import L from 'leaflet';
import { ObjectType } from '../../model';
import { Behavior } from '../../model/behaviors';
import { randomInt } from '../../utils';
import { appendAnimation, RotationAnimation } from '../animation';
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

  onNoopClick(evt: L.LeafletMouseEvent): void {
    this.points.push(evt.latlng);
    L.marker(evt.latlng).addTo(this.map);
    if (this.points.length === 3) {
      this.translate();
      this.points = [];
    } else {
      // setTimeout(() => {
      //   this.rotate();
      // }, 4000);
    }
  }

  private translate() {
    const [p0, c1, c2] = this.points;
    const bot = this.wh.first<Bot>(ObjectType.bot);
    appendAnimation.call(bot, new BezierTranslationAnimation(bot, p0, c1, c2));
  }

  private rotate() {
    const bot = this.wh.first<Bot>(ObjectType.bot);
    const toDeg = randomInt(0, 360);
    appendAnimation.call(bot, new RotationAnimation(bot, toDeg));
  }
}
