import { Base } from './basic/Base.class';

export class EssModel extends Base {
  toSnapshot() {
    return null;
  }

  fromJSON(d: any): this {
    return this;
  }

  toJSON() {
    return {};
  }
}
