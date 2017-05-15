import React, { Component } from 'react';

class ParamRepetition extends Component {

  constructor(props) {
    super(props)

    this.SMALL_PENALTY = 10
    this.AVERAGE_PENALTY = 30
    this.LARGE_PENALTY = 100

    this.timeout = null
    this.paramChanged = this.paramChanged.bind(this)

    this.paramChanged(this.AVERAGE_PENALTY)
  }

  paramChanged(val)
  {
    this.props.onRepetitionChanged(val)
  }

  render() {
    let Input = ''
    if (this.props.mode && this.props.mode === 'expert') {
      Input = <span>Pénalité de répétition : <input type='number' min='0' max='100' defaultValue={this.props.value} ref='expertSize' onChange={() => this.paramChanged()}/></span>;
    }
    else if (this.props.mode === 'simple') {
      Input = <span><input type="radio" name="simpleSize" value={this.SMALL_MOZAIC} defaultChecked={this.props.value === this.SMALL_MOZAIC} onChange={() => this.paramChanged(this.SMALL_MOZAIC)}/><span>Petite péanlité</span>
                    <input type="radio" name="simpleSize" value={this.AVERAGE_MOZAIC} defaultChecked={this.props.value === this.AVERAGE_MOZAIC} onChange={() => this.paramChanged(this.AVERAGE_MOZAIC)} /><span>Moyenne pénalité</span>
                    <input type="radio" name="simpleSize" value={this.LARGE_MOZAIC} defaultChecked={this.props.value === this.LARGE_MOZAIC} onChange={() => this.paramChanged(this.LARGE_MOZAIC)} /><span>Grosse pénalité</span></span>
    }
    else {console.error('Bad mode')}

    return (
      <div className='ParamRepetition'>
        Taille : {Input}
      </div>
    );
  }
}

export default ParamRepetition