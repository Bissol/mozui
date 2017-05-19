import React, { Component } from 'react';

class ParamDistance extends Component {

  constructor(props) {
    super(props)

    this.paramChanged = this.paramChanged.bind(this)

    this.state = { descr : this.valToText(this.props.value)}
  }

  valToText() {
    let val = this.refs.distance ? this.refs.distance.value : this.props.value
    if (val < 20) {
      return "Privilégier les couleurs d'origine, quitte à perdre en précision des contours"
    }
    else if (val < 40) {
      return "Respecter les couleurs puis les contours"
    }
    else if (val < 60) {
      return "Equilibre entre couleurs et contours"
    }
    else if (val < 80) {
      return "Respecter les contours puis les couleurs"
    }
    else {
      return "Privilégier les contours, peu importe les couleurs. (rendu parfois artistique !)"
    }
  }

  paramChanged()
  {
    let val = this.refs.distance.value
    this.props.onDistanceChanged(val)
    this.setState({ descr : this.valToText(val)})
  }

  render() {
    let Input = ''
    if (this.props.mode && this.props.mode === 'expert') {
      Input = <span>Couleurs<input type='range' ref='distance' step="5" defaultValue={this.props.value} onChange={() => this.paramChanged()} /> Contours</span>;
    }

    return (
      <div className='ParamDistance param'>
        <p className="paramTitle">Comparaison des images</p>
        {Input}
        <p>{this.state.descr}</p>
      </div>
    );
  }
}

export default ParamDistance