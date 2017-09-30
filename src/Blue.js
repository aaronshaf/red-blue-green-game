import React from 'react'
import './Blue.css'

export default class Blue extends React.PureComponent {
  render() {
    const transform = `translateX(${this.props.x * 10}px) translateY(${this
      .props.y * 10}px)`
    return (
      <div
        className="Piece Blue"
        style={{
          transform
        }}
      />
    )
  }
}
