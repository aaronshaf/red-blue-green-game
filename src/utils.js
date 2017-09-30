// @flow
import { COLLISION_PROXIMITY, MAX_SPEED } from './constants'
import type { Piece } from './types'

export function getDistance(x1: number, y1: number, x2: number, y2: number) {
  const a = x1 - x2
  const b = y1 - y2
  return Math.sqrt(a * a + b * b)
}

export function getAngle(x1: number, y1: number, x2: number, y2: number) {
  return Math.atan2(y2 - y1, x2 - x1) // returns radians
}

export function getXYFromAngleAndDistance(angle: number, distance: number) {
  const x = distance * Math.cos(angle)
  const y = distance * Math.sin(angle)
  return [x, y]
}

export function normalizeAngle(angle: number) {
  // console.debug(angle / (Math.PI * 2))
  return angle / (Math.PI * 2) + 0.5
}

export function denormalizeAngle(normalizedAngle: number) {
  return normalizedAngle * (Math.PI * 2) - Math.PI
}

export function isWithinBoard(width: number, height: number) {
  return (piece: Piece) =>
    piece.positionX > -1 &&
    piece.positionY > -1 &&
    piece.positionX < width &&
    piece.positionY < height
}

export function denormalizeVelocity(normalizedVelocity: number) {
  return normalizedVelocity * (MAX_SPEED * 2) - MAX_SPEED
}

export function normalizeDistance(
  gridWidth: number,
  gridHeight: number,
  angle: number
) {
  return angle / Math.max(gridWidth, gridHeight)
}

export function coolidesWith(piece1: Piece) {
  return (piece2: Piece) => {
    return (
      getDistance(
        piece2.positionX,
        piece2.positionY,
        piece1.positionX + 1,
        piece1.positionY + 1
      ) <= COLLISION_PROXIMITY
    )
  }
}

export function doesNotCollideWith(piece1: Piece) {
  return (piece2: Piece) => {
    const distance = getDistance(
      piece1.positionX,
      piece1.positionY,
      piece2.positionX,
      piece2.positionY
    )
    return distance > COLLISION_PROXIMITY
  }
}

export function normalizeVelocity(velocity: number) {
  return (velocity + MAX_SPEED) / (MAX_SPEED * 2)
}
