/*
  Expected props
  - mode
  - luminosityCorrection
  - onLuminosityCorrectionChanged
*/

import React, { Component } from 'react';
import LessMoreControl from './less-more-ctrl'

class ParamLuminosityCorrection extends Component {

  constructor(props) {
    super(props)
    this.val2txt = { 
      0: `Aucune correction`,
      1: `Légère correction`,
      2: `Correction moyenne`,
      3: `Correction marquée`,
      4: `Forte correction`
    }

    this.PRECISION = 10

    this.state = {value: this.props.luminosityCorrection}

    this.luminosityCorrectionChanged = this.luminosityCorrectionChanged.bind(this)
  }

  
  luminosityCorrectionChanged(val)
  {
    this.setState({value: val})
    this.props.onLuminosityCorrectionChanged(val)
  }

  render() {
    let Input = ''
    if (this.props.mode && this.props.mode === 'expert') {
      Input = <LessMoreControl value={this.state.value} nbValues={this.PRECISION} onValueChanged={this.luminosityCorrectionChanged} />
    }
    else if (this.props.mode === 'simple') {
      Input = ''
    }
    else {console.error('Bad mode')}

    return (
      <div className='ParamLuminosityCorrection param'>
      <p className="paramTitle">Correction de l'éclairage</p>
      {Input}
      <p>{this.val2txt[Math.floor(this.state.value * (Object.keys(this.val2txt).length / this.PRECISION))]}</p>
      </div>
    );
  }
}

export default ParamLuminosityCorrection