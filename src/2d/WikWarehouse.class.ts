import { Circle, LayerList, SVGOverlayList, VectorLayerList } from './basic';
import { Bot } from './Bot.class';
import { Chargepile } from './Chargepile.class';
import { Conveyor } from './Conveyor.class';
import { Haiport } from './Haiport.class';
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
  readonly haiports: SVGOverlayList<Haiport>;
  readonly chargepiles: SVGOverlayList<Chargepile>;
  readonly bots: VectorLayerList<Bot>;
  readonly labors: VectorLayerList<Circle>;
  readonly rests: VectorLayerList<Circle>;
  readonly maintains: VectorLayerList<Circle>;

  readonly locations: LayerList<Location>;
  readonly conveyors: VectorLayerList<Conveyor>;

  constructor(injector: IInjector) {
    super();

    this.points = injector.$new<any>(VectorLayerList, 'point', 'canvas');
    this.shelfs = injector.$new<any>(VectorLayerList, 'shelf', 'canvas');
    this.haiports = injector.$new<any>(SVGOverlayList, 'haiport');
    this.chargepiles = injector.$new<any>(SVGOverlayList, 'chargepile');
    this.labors = injector.$new<any>(VectorLayerList, 'labor', 'canvas');
    this.rests = injector.$new<any>(VectorLayerList, 'rest', 'canvas');
    this.maintains = injector.$new<any>(VectorLayerList, 'maintainence', 'canvas');
    this.bots = injector.$new<any>(VectorLayerList, 'bot', 'canvas');
    // this.cacheShelfs = injector.$new<any>(LayerList);
    this.conveyors = injector.$new<any>(VectorLayerList, 'conveyor', 'canvas');
    this.locations = injector.$new<any>(LayerList);

    //#region set
    this.regList('point', this.points);
    this.regList('shelf', this.shelfs);
    this.regList('haiport', this.haiports);
    this.regList('chargepile', this.chargepiles);

    this.regList('labor', this.labors);
    this.regList('rest', this.rests);
    this.regList('maintain', this.maintains);

    this.regList('bot', this.bots);

    // this.addList('cacheShelf', this.cacheShelfs);
    this.regList('conveyor', this.conveyors);
    this.regList('location', this.locations);
    //#endregion
  }
}
