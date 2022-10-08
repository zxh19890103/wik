export interface Serializable {
  fromJSON(d: any): this;
  toJSON(): any;
}
