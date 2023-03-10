export type WikObjectType<Extra extends string = never> =
  | 'point'
  | 'shelf'
  | 'chargepile'
  | 'bot'
  | 'conveyor'
  | 'location'
  | 'labor'
  | 'rest'
  | 'maintain'
  | Extra;
