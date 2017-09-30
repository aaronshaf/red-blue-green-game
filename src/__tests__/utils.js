// @flow

import {
  getAngle,
  getDistance,
  getXYFromAngleAndDistance,
  denormalizeAngle
} from '../utils'
import round from 'lodash/round'

const PRECISION = 7

describe('getDistance', () => {
  it('1', () => {
    const x1 = 0
    const y1 = 0
    const x2 = 5
    const y2 = 5
    expect(getDistance(x1, y1, x2, y2)).toEqual(7.0710678118654755)
  })
})

describe('getAngle', () => {
  it('1', () => {
    const x1 = 0
    const y1 = 0
    const x2 = -1
    const y2 = 0
    expect(getAngle(x1, y1, x2, y2)).toEqual(Math.PI)
  })

  it('2', () => {
    const x1 = 0
    const y1 = 0
    const x2 = 0
    const y2 = 1
    expect(getAngle(x1, y1, x2, y2)).toEqual(Math.PI / 2)
  })

  it('3', () => {
    const x1 = 0
    const y1 = 0
    const x2 = 1
    const y2 = 0
    expect(getAngle(x1, y1, x2, y2)).toEqual(0)
  })

  it('4', () => {
    const x1 = 0
    const y1 = 0
    const x2 = 0
    const y2 = -1
    expect(getAngle(x1, y1, x2, y2)).toEqual(Math.PI / -2)
  })
})

describe('getXYFromAngleAndDistance', () => {
  it('1', () => {
    const x = -1
    const y = 0
    const angle = Math.atan2(y, x)
    const distance = Math.sqrt(x * x + y * y)
    const [resultX, resultY] = getXYFromAngleAndDistance(angle, distance)
    expect([round(resultX, PRECISION), round(resultY, PRECISION)]).toEqual([
      x,
      y
    ])
  })

  it('2', () => {
    const x = 0
    const y = 1
    const angle = Math.atan2(y, x)
    const distance = Math.sqrt(x * x + y * y)
    const [resultX, resultY] = getXYFromAngleAndDistance(angle, distance)
    expect([round(resultX, PRECISION), round(resultY, PRECISION)]).toEqual([
      x,
      y
    ])
  })

  it('3', () => {
    const x = 1
    const y = 0
    const angle = Math.atan2(y, x)
    const distance = Math.sqrt(x * x + y * y)
    const [resultX, resultY] = getXYFromAngleAndDistance(angle, distance)
    expect([round(resultX, PRECISION), round(resultY, PRECISION)]).toEqual([
      x,
      y
    ])
  })

  it('4', () => {
    const x = 1
    const y = -1
    const angle = Math.atan2(y, x)
    const distance = Math.sqrt(x * x + y * y)
    const [resultX, resultY] = getXYFromAngleAndDistance(angle, distance)
    expect([round(resultX, PRECISION), round(resultY, PRECISION)]).toEqual([
      x,
      y
    ])
  })
})

describe('denormalizeAngle', () => {
  it('1', () => {
    expect(denormalizeAngle(0)).toEqual(-1 * Math.PI)
  })

  it('2', () => {
    expect(denormalizeAngle(0.5)).toEqual(0)
  })

  it('3', () => {
    expect(denormalizeAngle(1)).toEqual(Math.PI)
  })
})
