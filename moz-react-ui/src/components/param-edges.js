/*
  Expected props
  - mode
  - edgesFactor
  - blendMode
  - onEdgesFactorChanged
  - onEdgesMergeModeChanged
*/

import React, { Component } from 'react';
import LessMoreControl from './less-more-ctrl'

class ParamEdges extends Component {

  constructor(props) {
    super(props)
    this.val2txt = { 
      0: `Aucun renforcement`,
      1: `Contours légèrement accentués`,
      2: `Contours accentués`,
      3: `Contours fortement accentués`,
      4: `Contours très marqués !`
    }

    this.blendModeOptions = {
      'luminosity': `description pour luminosité`,
      'color': `description pour color`,
      'saturation': `description pour saturation`,
      'hue': `description pour hue`,
      'exclusion': `description pour exclusion`,
      'soft-light': 'soft-light',
      'hard-light' : 'hard light',
      'color-burn': 'color-burn',
      'color-dodge' : 'color-dodge',
      'lighten' : 'lighten',
      'darken' : 'darken',
      'overlay' : 'overlay',
      'multiply' : 'multiply',
      'screen' : 'screen'
    }

    this.state = {blendMode: this.props.blendMode ? this.props.blendMode : 'luminosity',
                  value: this.props.edgesFactor}

    this.edgesFactorChanged = this.edgesFactorChanged.bind(this)
    this.blendModeChanged = this.blendModeChanged.bind(this)

    //console.log(`edgesFactor props value=${this.props.edgesFactor}`)
  }

  
  edgesFactorChanged(val)
  {
    this.setState({value: val})
    this.props.onEdgesFactorChanged(val)
  }

  blendModeChanged(event) {
    this.setState({blendMode: event.target.value})
    this.props.onEdgesMergeModeChanged(event.target.value)
  }

  render() {
    let Input = ''
    if (this.props.mode && this.props.mode === 'expert') {
      const options = Object.keys(this.blendModeOptions).map( (bm) => <option key={bm} value={bm}> {this.blendModeOptions[bm]}</option>)
      Input = <div>
                <LessMoreControl value={this.state.value} nbValues={5} onValueChanged={this.edgesFactorChanged} />
                <select value={this.state.blendMode} onChange={this.blendModeChanged}>{options}</select>
              </div>
    }
    else if (this.props.mode === 'simple') {
      Input = ''
    }
    else {console.error('Bad mode')}

    return (
      <div className='ParamEdges param'>
      <p className="paramTitle">Renforcement des contours</p>
      {Input}
      <p>{this.val2txt[this.state.value]}</p>
      </div>
    );
  }
}

export default ParamEdges