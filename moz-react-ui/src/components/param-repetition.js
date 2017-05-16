import React, { Component } from 'react';

class ParamRepetition extends Component {

  constructor(props) {
    super(props)

    this.SMALL_PENALTY = 10
    this.AVERAGE_PENALTY = 30
    this.LARGE_PENALTY = 100

    this.paramChanged = this.paramChanged.bind(this)
  }

  paramChanged(val)
  {
  	if (!val) {
  		this.props.onRepetitionChanged(this.refs.repetitionVal.value)
  	}
  	else {
  		this.props.onRepetitionChanged(val)
  	}
  }

  render() {
    let Input = ''
    if (this.props.mode && this.props.mode === 'expert') {
      Input = <span>Pénalité de répétition : <input type='number' min='0' max='100' defaultValue={this.props.value} ref='repetitionVal' onChange={() => this.paramChanged()}/></span>;
    }
    else if (this.props.mode === 'simple') {
      Input = <span><input type="radio" name="simpleRepetition" value={this.SMALL_PENALTY} defaultChecked={this.props.value === this.SMALL_PENALTY} onChange={() => this.paramChanged(this.SMALL_PENALTY)}/><span>Petite péanlité</span>
                    <input type="radio" name="simpleRepetition" value={this.AVERAGE_PENALTY} defaultChecked={this.props.value === this.AVERAGE_PENALTY} onChange={() => this.paramChanged(this.AVERAGE_PENALTY)} /><span>Moyenne pénalité</span>
                    <input type="radio" name="simpleRepetition" value={this.LARGE_PENALTY} defaultChecked={this.props.value === this.LARGE_PENALTY} onChange={() => this.paramChanged(this.LARGE_PENALTY)} /><span>Grosse pénalité</span></span>
    }
    else {console.error('Bad mode')}

    return (
      <div className='ParamRepetition'>
        Répétition des imagettes : {Input}
      </div>
    );
  }
}

export default ParamRepetition