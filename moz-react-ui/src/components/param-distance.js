import React, { Component } from 'react';
import LessMoreControl from './less-more-ctrl'

class ParamDistance extends Component {

  constructor(props) {
    super(props)

    this.paramChanged = this.paramChanged.bind(this)

    this.val2txt = { 
      0: `Privilégier les couleurs d'origine (contours moins précis)`,
      25: `Respecter les couleurs puis les contours`,
      50: `Equilibre entre couleurs et contours`,
      75: `Respecter les contours puis les couleurs`,
      100: `Privilégier les contours (couleurs non respectées)`
    }

    this.PRECISION = 5
    this.STEP = 25

    this.state = {value: this.props.value}

    // this.state = { descr : this.valToText(this.props.value)}
  }

  // valToText() {
  //   let val = this.refs.distance ? this.refs.distance.value : this.props.value
  //   if (val < 20) {
  //     return "Privilégier les couleurs d'origine, quitte à perdre en précision des contours"
  //   }
  //   else if (val < 40) {
  //     return "Respecter les couleurs puis les contours"
  //   }
  //   else if (val < 60) {
  //     return "Equilibre entre couleurs et contours"
  //   }
  //   else if (val < 80) {
  //     return "Respecter les contours puis les couleurs"
  //   }
  //   else {
  //     return "Privilégier les contours, peu importe les couleurs. (rendu parfois artistique !)"
  //   }
  // }

  paramChanged(val)
  {
    this.setState({value: val})
    this.props.onDistanceChanged(val)
  }

  render() {
    // Input = <span>Couleurs<input type='range' ref='distance' step="5" defaultValue={this.props.value} onChange={() => this.paramChanged()} /> Contours</span>;
    let Input = ''
    if (this.props.mode && this.props.mode === 'expert') {
      Input = <LessMoreControl lessButtonLabel='Couleurs' moreButtonLabel='Contours' value={this.state.value} nbValues={this.PRECISION} step={this.STEP} onValueChanged={this.paramChanged} />
    }

    return (
      <div className='ParamDistance param'>
        <p className="paramTitle">Priorité couleurs/contours</p>
        {Input}
        <p>{this.val2txt[Math.floor(this.state.value * (Object.keys(this.val2txt).length / this.PRECISION))]}</p>
      </div>
    );
  }
}

export default ParamDistance