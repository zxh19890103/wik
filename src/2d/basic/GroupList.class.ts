import L from 'leaflet';
import { Group } from './Group.class';
import { LayerList } from './LayerList.class';
import { WikMap } from './Map.class';

interface GroupListOptions {
  pane: string;
}

export class GroupList<E extends string = never> extends LayerList<Group, E> {
  constructor(groups: Group[], private options: GroupListOptions = { pane: 'allGroup' }) {
    super(groups);
  }

  protected override _add(item: Group<{}>): void {
    L.setOptions(item, { paneName: this.options.pane });

    super._add(item);
  }

  protected override _remove(item: Group<{}>): void {
    super._remove(item);

    L.setOptions(item, { paneName: null });
  }
}
