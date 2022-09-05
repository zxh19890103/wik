export type AnyObject = Record<string, any>;

export type PolylineLatLngs =
  | L.LatLngExpression[]
  | L.LatLngExpression[][]
  | L.LatLngExpression[][][];

export type ContextMenuItem = {
  value: string;
  text: string;
  disabled?: boolean;
  visible?: boolean;
  callback?: string | (() => void);
};

export type CapitalCharacter =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z';
