import React, { Component } from 'react';
import LessMoreControl from './less-more-ctrl'

class ParamRepetition extends Component {

  constructor(props) {
    super(props)

    this.val2txt = { 
      0: `Répétition autorisée`,
      20: `Un peu moins de répétitions`,
      40: `Moins de répétitions`,
      60: `Minimise les répétitions`,
      80: `Répétitions minimisées`
    }
    // this.SMALL_PENALTY = 10
    // this.AVERAGE_PENALTY = 30
    // this.LARGE_PENALTY = 100
    this.state = {value: this.props.value}
    this.paramChanged = this.paramChanged.bind(this)
  }

  paramChanged(val)
  {
    this.setState({value: val})
    this.props.onRepetitionChanged(val)
  }

  render() {
    let Input = ''
    if (this.props.mode && this.props.mode === 'expert') {
      Input = <LessMoreControl value={this.state.value} nbValues={5} step={20} onValueChanged={this.paramChanged} />
    }
    else if (this.props.mode === 'simple') {
      Input = ''
    }
    else {console.error('Bad mode')}

    return (
      <div className='ParamLuminosityCorrection param'>
      <p className="paramTitle">Répétition des petites images</p>
      {Input}
      <p>{this.val2txt[this.state.value]}</p>
      </div>
    );
  }
}

export default ParamRepetition