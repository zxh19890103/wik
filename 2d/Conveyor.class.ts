import L from 'leaflet';
import { Group } from './basic/Group.class';
import { ConveyorNode } from './ConveyorNode.class';
import { meta } from './meta';

export class Conveyor extends Group<ConveyorNode> {
  type: meta.ConveyorType = 'singleIO';
  line: L.Polyline = null;

  constructor(nodes: ConveyorNode[], meta?: meta.Conveyor) {
    super(nodes);
  }
}
