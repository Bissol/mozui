import React, { PureComponent } from 'react';
import './mosaic-parameters.css';
import ParamMosaicSize from './param-mosaic-size.js';
import ParamAllowTileFlip from './param-allow-tile-flip.js';

class MosaicParameters extends PureComponent {

  constructor(props) {
    super(props)

    this.mosaicSizeChanged = this.mosaicSizeChanged.bind(this)
    this.allowTileFlip = this.allowTileFlip.bind(this)
    
    const mode_DEFAULT = 'simple'
    this.state = 
    {
      mode : (localStorage.getItem('paramMode') ? localStorage.getItem('paramMode') : mode_DEFAULT),
      parameters : this.props.initialParameters
    }
  }

  // =================================================================== PARAMETERS ============================================================

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

  allowTileFlip(val) {
    let tmpState = this.state.parameters
    tmpState.allowTileFlip = val
    this.setState({parameters: tmpState})
    localStorage.setItem('allowTileFlip', val)
    this.props.onParametersChanged(this.state.parameters, 'allowTileFlip')
  }

  // =================================================================== ACTIONS ============================================================

  buildMosaic() {
    console.log('click')
    this.props.onBuildMosaic()
  }

  // =================================================================== RENDERING ============================================================
  render() {
    console.log('Rendering mosaic parameters in ' + this.state.mode + ' mode')
     
    return (
      <div id="MosaicParametersDiv">
        <span>Mode simple</span><input type="checkbox" defaultChecked={this.state.mode === 'simple'} onChange={() => this.toggleMode()}/>
        <ParamMosaicSize mode={this.state.mode} value={parseInt(this.state.parameters.numColRow, 10)} onMosaicSizeChanged={this.mosaicSizeChanged}/>
        <ParamAllowTileFlip mode={this.state.mode} value={this.state.parameters.allowTileFlip} onAllowTileFlip={this.allowTileFlip} />
        <div className='actions'>
          <button onClick={() => this.buildMosaic()}>Créer ma mosaïque</button>
        </div>
      </div>
    );
  }
}

export default MosaicParameters