export interface Serializable {
  fromJSON(d: any): this;
  toJSON<J = any>(): J;
}
