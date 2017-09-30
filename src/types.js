export type Piece = {|
  id: string,
  velocity: number,
  angle: number,
  positionX: number,
  positionY: number
|}

export type GreenPiece = Piece & {|
  originalBlue: Piece
|}

export type UIEvent = MouseEvent & {|
  layerX: number,
  layerY: number
|}
