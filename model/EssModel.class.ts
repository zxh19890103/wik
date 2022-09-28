import { Base } from './basic';

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
