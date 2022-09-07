import L from 'leaflet';
import { ObjectType } from '../../model';
import { Behavior } from '../../model/behaviors';
import { appendAnimation } from '../animation';
import { BezierTranslationAnimation } from '../animation/BezierTranslationAnimation.class';
import { HrMap } from '../basic/Map.class';
import { Bot } from '../Bot.class';
import { Warehouse } from '../Warehouse.class';

export class BezierBehavior extends Behavior {
  constructor(private map: HrMap, private wh: Warehouse) {
    super();
  }

  override onLoad(): void {
    console.log('load BezierBehavior');
  }

  override onUnload(): void {
    console.log('load BezierBehavior');
  }

  private points: L.LatLngLiteral[] = [];

  onNoopClick(evt: L.LeafletMouseEvent): void {
    this.points.push(evt.latlng);
    L.marker(evt.latlng).addTo(this.map);
    if (this.points.length === 3) {
      const [p0, c1, c2] = this.points;
      const bot = this.wh.first<Bot>(ObjectType.bot);
      appendAnimation.call(bot, new BezierTranslationAnimation(bot, p0, c1, c2));
      this.points = [];
    }
  }
}
