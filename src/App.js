import React from 'react'
import Game from './Game'
import './App.css'

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">red-blue-green</h1>
        </header>
        <Game />
      </div>
    )
  }
}

export default App
