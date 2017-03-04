import React, { Component } from 'react';
import './mosaic-parameters.css';
import ParamMosaicSize from './param-mosaic-size.js';

class MosaicParameters extends Component {

  constructor(props) {
    super(props)

    this.mosaicSizeChanged = this.mosaicSizeChanged.bind(this)

    
    const mode_DEFAULT = 'simple'
    this.state = 
    {
      mode : (localStorage.getItem('paramMode') ? localStorage.getItem('paramMode') : mode_DEFAULT),
      parameters : this.props.initialParameters
    }
  }

  toggleMode() {
    const newMode = this.state.mode === 'simple' ? 'expert' : 'simple'
    this.setState({mode: newMode})
    localStorage.setItem('paramMode', newMode)
  }

  mosaicSizeChanged(val) {
    let tmpState = this.state.parameters
    tmpState.numColRow = val
    this.setState({parameters: tmpState})
    localStorage.setItem('numColRow', val)
    this.props.onParametersChanged(this.state.parameters, 'numColRow')
  }

  render() {
    console.log('Rendering mosaic parameters in ' + this.state.mode + ' mode')
     
    return (
      <div className="MosaicParametersDiv">
        <span>Mode simple</span><input type="checkbox" defaultChecked={this.state.mode === 'simple'} onChange={() => this.toggleMode()}/>
        <ParamMosaicSize mode={this.state.mode} value={parseInt(this.state.parameters.numColRow, 10)} onMosaicSizeChanged={this.mosaicSizeChanged}/>
      </div>
    );
  }
}

export default MosaicParameters