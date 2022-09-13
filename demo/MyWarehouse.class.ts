import { Warehouse } from '../2d/Warehouse.class';
import * as hrGUI from '../2d';
import { injectCtor } from '../model/basic/inject';
import * as Interface from '../interfaces/symbols';
import { ModeManager } from '../model/modes/ModeManager.class';

@injectCtor(Interface.IModeManager)
export class MyWarehouse extends Warehouse<any, 'bot2'> {
  constructor(public readonly modeMgr: ModeManager) {
    super();

    this.addUpdateDep('location', (item: hrGUI.Location, data) => {
      item.position = data.position;
    });
  }

  layout(data: any): void {
    const {
      shelfPojo,
      pointPojo,
      chargePilePojo,
      haiPortPojo,
      shelfTemplate,
      location,
      extendedEquipment,
    } = data;

    for (let i = 0, s = location.length; i < s; i++) {
      const { position } = pointPojo[i];
      this.locations.add(new hrGUI.Location(position));
    }

    for (let i = 0, s = extendedEquipment.length; i < s; i++) {
      const { position } = pointPojo[i];
      this.locations.add(new hrGUI.Location(position));
    }

    for (let i = 0, s = pointPojo.length; i < s; i++) {
      const { position } = pointPojo[i];
      this.points.add(new hrGUI.Point(position));
    }

    const share_meta = {
      unitL: 600,
      unitW: 400,
      gapL: 20,
      gapW: 20,
      pilarR: 5,
    };

    const tplMap = Object.fromEntries(
      shelfTemplate.map((x) => {
        return [x.id, x];
      }),
    );

    const shelfs: string[] = [];
    for (let i = 0, s = shelfPojo.length; i < s; i++) {
      const { position, deepStorage, theta, templateId } = shelfPojo[i];
      const { attribute } = tplMap[templateId];
      const rows = deepStorage ? 2 : 1;

      const shelf = new hrGUI.Shelf(position, {
        angle: theta,
        columns: attribute.column,
        rows: rows,
        ...share_meta,
        unitL: attribute.totalLength / attribute.column - 120,
        unitW: attribute.totalWidth / rows - 120,
      });

      shelfs.push(shelf.layerId);

      this.shelfs.add(shelf);
    }

    const chargepiles: string[] = [];
    for (let i = 0, s = chargePilePojo.length; i < s; i++) {
      const { position, theta } = chargePilePojo[i];
      const charge = new hrGUI.Chargepile(position, null, { angle: theta });
      chargepiles.push(charge.layerId);
      this.chargepiles.add(charge);
    }

    for (let i = 0, s = haiPortPojo.length; i < s; i++) {
      const { position } = haiPortPojo[i];
      this.haiports.add(new hrGUI.Haiport(position, null));
    }
  }
}
