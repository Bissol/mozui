/*
  Expected props:
  - value
  - nbValues
  - onValueChanged

  Optional props:
  - min
  - step
  - lessButtonLabel
  - moreButtonLabel
*/

import React, { Component } from 'react';
import './lessMoreControl.css';

class LessMoreControl extends Component {

  constructor(props) {
    super(props)

    this.min = this.props.min ? this.props.min : 0
    this.step = this.props.step ? this.props.step : 1
    this.max = this.step * (this.props.nbValues - 1)
    this.lessButtonLabel = this.props.lessButtonLabel ? this.props.lessButtonLabel : `Moins`
    this.moreButtonLabel = this.props.moreButtonLabel ? this.props.moreButtonLabel : `Plus`

    this.modifyValue = this.modifyValue.bind(this)
  }

  modifyValue(val)
  {
    // Not supposed to happen
    if (parseInt(this.props.value, 10) > this.max) {
      this.props.onValueChanged(this.max)
      return
    } else if (parseInt(this.props.value, 10) < this.min) {
      this.props.onValueChanged(this.min)
      return
    }

    // Stop if limits reached
    if (val < 0 && parseInt(this.props.value, 10) <= this.min) val = 0
    if (val > 0 && parseInt(this.props.value, 10) >= this.max) val = 0

    if (val !== 0) {
      let sv = parseInt(this.props.value, 10) + val
      if (isNaN(sv)) sv = this.min
      console.log(`sv=${sv} val = ${val} step=${this.step} propsval=${parseInt(this.props.value, 10)}`)
      this.props.onValueChanged(sv)
    }
  }

  render() {
    let disless = ((parseInt(this.props.value, 10) <= this.min) ? 'disabled' : '')
    let dismore = ((parseInt(this.props.value, 10) >= this.max) ? 'disabled' : '')

    return (
      <div className='LessMoreControl'>
        <input type='button' disabled={disless} className='rangeButton' value={this.lessButtonLabel} onClick={() => this.modifyValue(this.step * -1)} />
        <meter min={this.min} low={this.max * 0.2} high={this.max * 0.8} max={this.max} value={parseInt(this.props.value, 10)}></meter>
        <input type='button' disabled={dismore} className='rangeButton' value={this.moreButtonLabel} onClick={() => this.modifyValue(this.step)} />
      </div>
    );
  }
}

export default LessMoreControl