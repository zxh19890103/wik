import { Group } from './basic/Group.class';
import * as meta from '@/model/meta';
import { Shelf } from './Shelf.class';

export class CacheShelf extends Group {
  constructor(shelfs: Shelf[], meta?: meta.CacheShelf) {
    super(shelfs);
  }
}
