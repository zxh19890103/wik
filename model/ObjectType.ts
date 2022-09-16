export type ObjectType<O extends string = never> =
  | 'point'
  | 'shelf'
  | 'haiport'
  | 'chargepile'
  | 'bot'
  | 'cacheShelf'
  | 'conveyor'
  | 'location'
  | O;
