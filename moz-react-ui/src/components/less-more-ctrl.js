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
    if (val < 0 && this.props.value <= this.min) val = 0
    if (val > 0 && this.props.value >= this.max) val = 0

    if (val !== 0) {
      let sv = this.props.value + val
      console.log(`sv=${sv} val = ${val} step=${this.step} propsval=${this.props.value}`)
      this.props.onValueChanged(sv)
    }
  }

  render() {
    let disless = ((this.props.value <= this.min) ? 'disabled' : '')
    let dismore = ((this.props.value >= this.max) ? 'disabled' : '')

    return (
      <div className='LessMoreControl'>
        <input type='button' disabled={disless} className='rangeButton' value={this.lessButtonLabel} onClick={() => this.modifyValue(this.step * -1)} />
        

        <span>{this.props.value}</span>
        <input type='button' disabled={dismore} className='rangeButton' value={this.moreButtonLabel} onClick={() => this.modifyValue(this.step)} />
      </div>
    );
  }
}

export default LessMoreControl