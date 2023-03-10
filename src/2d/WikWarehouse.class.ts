import { Circle, MarkerList, SVGOverlayList, VectorLayerList } from './basic';
import { Bot } from './Bot.class';
import { Chargepile } from './Chargepile.class';
import { Conveyor } from './Conveyor.class';
import { Location } from './Location.class';
import { Point } from './Point.class';
import { Shelf } from './Shelf.class';

import { IInjector } from '@/interfaces';
import { Warehouse } from './basic/Warehouse.class';
import { WikObjectType } from '@/model';

export abstract class WikWarehouse<LayoutData = any, OT extends string = never> extends Warehouse<
  LayoutData,
  WikObjectType<OT>
> {
  readonly points: VectorLayerList<Point>;
  readonly shelfs: VectorLayerList<Shelf>;
  readonly chargepiles: SVGOverlayList<Chargepile>;
  readonly bots: VectorLayerList<Bot>;
  readonly labors: VectorLayerList<Circle>;
  readonly rests: VectorLayerList<Circle>;
  readonly maintains: VectorLayerList<Circle>;

  readonly locations: MarkerList<Location>;
  readonly conveyors: VectorLayerList<Conveyor>;

  constructor(injector: IInjector) {
    super();

    this.points = injector.$new(VectorLayerList<Point>, 'point', 'canvas');
    this.shelfs = injector.$new(VectorLayerList<Shelf>, 'shelf', 'canvas');
    this.chargepiles = injector.$new(SVGOverlayList<Chargepile>, 'chargepile');
    this.labors = injector.$new(VectorLayerList<Circle>, 'labor', 'canvas');
    this.rests = injector.$new(VectorLayerList<Circle>, 'rest', 'canvas');
    this.maintains = injector.$new(VectorLayerList<Circle>, 'maintainence', 'canvas');
    this.bots = injector.$new(VectorLayerList<Bot>, 'bot', 'canvas');
    this.conveyors = injector.$new(VectorLayerList<Conveyor>, 'conveyor', 'canvas');
    this.locations = injector.$new(MarkerList<Location>, 'location');

    //#region set
    this.regList('point', this.points);
    this.regList('shelf', this.shelfs);
    this.regList('chargepile', this.chargepiles);

    this.regList('labor', this.labors);
    this.regList('rest', this.rests);
    this.regList('maintain', this.maintains);

    this.regList('bot', this.bots);

    this.regList('conveyor', this.conveyors);
    this.regList('location', this.locations);
    //#endregion
  }
}
