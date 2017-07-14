import React, { Component } from 'react';
import './rangeControl.css';
//import tilesImg from '../../public/tiles.png'

class rangeControl extends Component {

  constructor(props) {
    super(props)

    this.modifyValue = this.modifyValue.bind(this)

    this.state = {currentValue : this.props.init}
  }

  modifyValue(val)
  {
    if (val < 0 && this.state.currentValue <= this.props.min) val = 0
    if (val > 0 && this.state.currentValue >= this.props.max) val = 0
    this.setState({currentValue : this.state.currentValue + val}, () => {
      this.props.onNewValue(this.state.currentValue)
    })
  }

  render() {
    
    return (
      <div className='rangeControl'>
        <input type='button' className='rangeButton' value='-' onClick={() => this.modifyValue(-1)} />
        <input type='range' defaultValue={this.state.currentValue} min={this.props.min} max={this.props.max} />
        <input type='button' className='rangeButton' value='+' onClick={() => this.modifyValue(1)} />
      </div>
    );
  }
}

export default rangeControl