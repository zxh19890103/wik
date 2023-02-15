import L from 'leaflet';
import { Group } from './basic/Group.class';
import { ConveyorNode } from './ConveyorNode.class';
import { meta } from '@/model';

export class Conveyor extends Group {
  type: meta.ConveyorType = 'singleIO';
  line: L.Polyline = null;

  constructor(nodes: ConveyorNode[], meta?: meta.Conveyor) {
    super(nodes);
  }
}
