// @flow

import React from 'react'
import clamp from 'lodash/clamp'
import Blue from './Blue'
import Green from './Green'
import Red from './Red'
import uuid from 'uuid'
import neataptic from 'neataptic'
import {
  coolidesWith,
  denormalizeAngle,
  doesNotCollideWith,
  getAngle,
  getDistance,
  getXYFromAngleAndDistance,
  isWithinBoard,
  normalizeAngle,
  normalizeDistance,
  normalizeVelocity
} from './utils'
import { INTERVAL, MIN_SPEED, MAX_SPEED } from './constants'
import type { UIEvent, Piece, GreenPiece } from './types'
import './Game.css'

type State = {|
  blue: Piece,
  greens: Array<GreenPiece>,
  height: number,
  isTraining: boolean,
  iterations: number,
  reds: Array<Piece>,
  score: number,
  width: number
|}

export default class Game extends React.Component<{}, State> {
  network: any
  interval: number
  div: HTMLElement

  constructor() {
    super()
    const width = 32
    const height = 32
    this.network = createNetwork()
    this.state = {
      blue: {
        velocity: 0.5,
        angle: 0,
        positionX: Math.floor(width / 4),
        positionY: Math.floor(height / 2)
      },
      greens: [],
      height,
      isTraining: true,
      iterations: 0,
      reds: [],
      score: 0,
      width
    }
  }
  componentDidMount() {
    this.interval = setInterval(() => {
      requestAnimationFrame(this.process)
    }, INTERVAL)
    // this.divDimensions = this.div.getBoundingClientRect()
    this.div.addEventListener('mousedown', this.handleMouseDown)
    window.addEventListener('blur', () => {
      clearInterval(this.interval)
    })
    window.addEventListener('focus', () => {
      this.interval = setInterval(() => {
        requestAnimationFrame(this.process)
      }, INTERVAL)
    })
  }

  componentWillUnmount() {
    this.div.removeEventListener('mousedown', this.handleMouseDown)
  }

  handleMouseDown = (event: UIEvent) => {
    const x1 = this.state.blue.positionX
    const y1 = this.state.blue.positionY
    const x2 = event.layerX / 10
    const y2 = event.layerY / 10
    const angle = getAngle(x1, y1, x2, y2)
    const velocity = getDistance(x1, y1, x2, y2) * 4 / this.state.height
    this.setState({
      blue: {
        id: this.state.blue.id,
        positionX: this.state.blue.positionX,
        positionY: this.state.blue.positionY,
        velocity,
        angle
      }
    })
  }

  // handleKeydown = (event: Event) => {
  //   let speedX = this.state.blue.speedX
  //   let speedY = this.state.blue.speedY
  //   switch (event.key) {
  //     case 'ArrowLeft':
  //       event.preventDefault()
  //       speedX = clamp(speedX - 0.5, -2, 2)
  //       speedY = speedY / 2
  //       break
  //     case 'ArrowUp':
  //       event.preventDefault()
  //       speedX = speedX / 2
  //       speedY = clamp(speedY - 0.5, -2, 2)
  //       break
  //     case 'ArrowRight':
  //       event.preventDefault()
  //       speedX = clamp(speedX + 0.5, -2, 2)
  //       speedY = speedY / 2
  //       break
  //     case 'ArrowDown':
  //       event.preventDefault()
  //       speedX = speedX / 2
  //       speedY = clamp(speedY + 0.5, -2, 2)
  //       break
  //     default:
  //       return
  //   }
  //
  //   this.setState({
  //     blue: {
  //       ...this.state.blue,
  //       speedX,
  //       speedY
  //     }
  //   })
  // }

  process = () => {
    const [deltaX, deltaY] = getXYFromAngleAndDistance(
      this.state.blue.angle,
      this.state.blue.velocity
    )
    let blue
    if (this.state.isTraining && Math.random() < 0.1) {
      blue = {
        ...this.state.blue,
        angle: Math.random() * (2 * Math.PI) - Math.PI,
        velocity: Math.random() * MAX_SPEED
      }
    } else {
      blue = {
        ...this.state.blue,
        positionX: clamp(
          this.state.blue.positionX + deltaX,
          0,
          this.state.width - 1
        ),
        positionY: clamp(
          this.state.blue.positionY + deltaY,
          0,
          this.state.height - 1
        )
      }
    }
    const reds = this.state.reds
      .filter(doesNotCollideWith(blue))
      .filter(isWithinBoard(this.state.width, this.state.height))
      .map(piece => {
        const [deltaX, deltaY] = getXYFromAngleAndDistance(
          piece.angle,
          piece.velocity
        )
        return {
          ...piece,
          positionX: clamp(piece.positionX + deltaX, -1, this.state.width),
          positionY: clamp(piece.positionY + deltaY, -1, this.state.height)
        }
      })
    if (Math.random() < 0.2) {
      const centerX = Math.floor(this.state.width / 2)
      const centerY = Math.floor(this.state.height / 2)
      const distance = getDistance(
        centerX,
        centerY,
        blue.positionX,
        blue.positionY
      )
      const angleToBlue = getAngle(
        centerX,
        centerY,
        blue.positionX,
        blue.positionY
      )
      const redVelocity = Math.max(MIN_SPEED, Math.random() * MAX_SPEED)

      const input = [
        // normalizeVelocity(redVelocity), // red velocity
        // normalizeVelocity(blue.velocity), // blue velocity
        // blue.angle // blue angle
        normalizeAngle(angleToBlue)
        // normalizeDistance(this.state.width, this.state.height, distance)
      ]
      const result = this.network.activate(input)
      const redAngle = denormalizeAngle(result[0])
      console.debug(`${normalizeAngle(angleToBlue)} -> ${result[0]}`)

      const newRed = {
        id: uuid.v1(),
        angle: redAngle,
        velocity: redVelocity,
        positionX: centerX,
        positionY: centerY
      }
      reds.push(newRed)
    }

    const trainingSet = this.state.greens
      .filter(coolidesWith(blue))
      .map(green => {
        const angle = getAngle(
          Math.floor(this.state.width / 2),
          Math.floor(this.state.height / 2),
          green.originalBlue.positionX,
          green.originalBlue.positionY
        )
        const distance = getDistance(
          Math.floor(this.state.width / 2),
          Math.floor(this.state.height / 2),
          green.originalBlue.positionX,
          green.originalBlue.positionY
        )
        console.debug(
          `--- ${normalizeAngle(green.angle)} -> ${normalizeAngle(green.angle)}`
        )
        return {
          input: [
            // normalizeVelocity(green.velocity), // green velocity
            // normalizeVelocity(green.originalBlue.velocity), // blue velocity
            // green.originalBlue.angle
            normalizeAngle(green.angle)
            // normalizeDistance(this.state.width, this.state.height, distance)
          ],
          output: [normalizeAngle(green.angle)]
        }
      })
    if (trainingSet.length > 0) {
      this.network.evolve(trainingSet, {
        population: 20,
        // elitism: 20,
        error: 0.2
      })
    }
    const greens = this.state.greens
      .filter(doesNotCollideWith(blue))
      .filter(isWithinBoard(this.state.width, this.state.height))
      .map(green => {
        const [deltaX, deltaY] = getXYFromAngleAndDistance(
          green.angle,
          green.velocity
        )

        return {
          ...green,
          positionX: clamp(green.positionX + deltaX, -1, this.state.width),
          positionY: clamp(green.positionY + deltaY, -1, this.state.height)
        }
      })
    if (Math.random() < 0.2) {
      // const speedX = Math.random() * -2 + 1
      // const speedY = Math.random() * -2 + 1

      const centerX = Math.floor(this.state.width / 2)
      const centerY = Math.floor(this.state.height / 2)
      const blueX = this.state.blue.positionX
      const blueY = this.state.blue.positionY

      const velocity = Math.max(MIN_SPEED, Math.random() * MAX_SPEED)
      const angle = getAngle(centerX, centerY, blueX, blueY)
      const newGreen: GreenPiece = {
        id: uuid.v1(),
        velocity,
        angle,
        positionX: centerX,
        positionY: centerY,
        originalBlue: blue
      }

      greens.push(newGreen)
    }

    this.setState({
      blue,
      greens,
      iterations: this.state.iterations + 1,
      reds
    })
  }

  setDivRef = (node: mixed) => {
    if (node instanceof HTMLElement) {
      this.div = node
    }
  }

  handleSaveNetwork = () => {
    const json = JSON.stringify(this.network.toJSON())
    console.debug(json.length)
    window.localStorage.network = json
  }

  handleLoadNetwork = () => {
    try {
      const object = JSON.parse(window.localStorage.network)
      console.debug(object)
      this.network = neataptic.Network.fromJSON(object)
    } catch (error) {
      console.error(error)
    }
  }

  handleDeleteNetwork = () => {
    localStorage.removeItem('network')
    this.network = createNetwork()
  }

  render() {
    const greenComponents = this.state.greens.map(piece => {
      return <Green key={piece.id} x={piece.positionX} y={piece.positionY} />
    })
    const redComponents = this.state.reds.map(piece => {
      return <Red key={piece.id} x={piece.positionX} y={piece.positionY} />
    })

    return (
      <div ref={this.setDivRef}>
        <div>
          <button onClick={this.handleSaveNetwork}>Save network</button>
          <button onClick={this.handleLoadNetwork}>Load network</button>
          <button onClick={this.handleDeleteNetwork}>Delete network</button>
        </div>
        <div
          className="Game"
          style={{
            width: `${this.state.width * 10}px`,
            height: `${this.state.height * 10}px`,
            backgroundColor: this.state.isGameOver ? '#FFC0CB' : '#EEE'
          }}
        >
          <Blue x={this.state.blue.positionX} y={this.state.blue.positionY} />
          {greenComponents}
          {redComponents}
        </div>
        <div style={{ fontSize: '0.8rem' }}>{this.state.iterations}</div>
      </div>
    )
  }
}

function createNetwork() {
  return neataptic.architect.Random(1, 2, 1)
}
