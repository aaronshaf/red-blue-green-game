import React from 'react'
import './Red.css'

export default class Red extends React.PureComponent {
  render() {
    const transform = `translateX(${this.props.x * 10}px) translateY(${this
      .props.y * 10}px)`
    return <div className="Piece Red" style={{ transform }} />
  }
}
