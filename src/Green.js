import React from 'react'
import './Green.css'

export default class Green extends React.PureComponent {
  render() {
    const transform = `translateX(${this.props.x * 10}px) translateY(${this
      .props.y * 10}px)`
    return <div className="Green" style={{ transform }} />
  }
}
