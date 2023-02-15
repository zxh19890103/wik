export type WikObjectType<Extra extends string = never> =
  | 'point'
  | 'shelf'
  | 'haiport'
  | 'chargepile'
  | 'bot'
  | 'cacheShelf'
  | 'conveyor'
  | 'location'
  | 'labor'
  | 'rest'
  | 'maintain'
  | Extra;
