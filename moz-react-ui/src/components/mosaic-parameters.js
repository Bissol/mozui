import React, { PureComponent } from 'react';
import './mosaic-parameters.css';
import ParamMosaicSize from './param-mosaic-size.js';
import ParamAllowTileFlip from './param-allow-tile-flip.js';
import ParamDistance from './param-distance.js';
import ParamRepetition from './param-repetition.js';

class MosaicParameters extends PureComponent {

  constructor(props) {
    super(props)

    this.mosaicSizeChanged = this.mosaicSizeChanged.bind(this)
    this.allowTileFlip = this.allowTileFlip.bind(this)
    this.distanceChanged = this.distanceChanged.bind(this)
    this.repetitionChanged = this.repetitionChanged.bind(this)
    
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

  distanceChanged(val) {
    let tmpState = this.state.parameters
    tmpState.distance = val
    this.setState({parameters: tmpState})
    localStorage.setItem('distance', val)
    this.props.onParametersChanged(this.state.parameters, 'distance')
  }

  repetitionChanged(val) {
    let tmpState = this.state.parameters
    tmpState.repetition = val
    this.setState({parameters: tmpState})
    localStorage.setItem('repetition', val)
    this.props.onParametersChanged(this.state.parameters, 'repetition')
  }

  // =================================================================== ACTIONS ============================================================

  buildMosaic() {
    this.props.onBuildMosaic()
  }

  renderMosaic() {
    this.props.onRenderMosaic()
  }

  // =================================================================== RENDERING ============================================================
  render() {
    console.log('Rendering mosaic parameters in ' + this.state.mode + ' mode')
     
    return (
      <div id="MosaicParametersDiv">
        <div className="param"><span>Mode simple</span><input type="checkbox" defaultChecked={this.state.mode === 'simple'} onChange={() => this.toggleMode()}/></div>
        <ParamMosaicSize mode={this.state.mode} value={parseInt(this.state.parameters.numColRow, 10)} onMosaicSizeChanged={this.mosaicSizeChanged}/>
        <ParamAllowTileFlip mode={this.state.mode} value={this.state.parameters.allowTileFlip} onAllowTileFlip={this.allowTileFlip} />
        <ParamDistance mode={this.state.mode} value={this.state.parameters.distance } onDistanceChanged={this.distanceChanged}/>
        <ParamRepetition mode={this.state.mode} value={this.state.parameters.repetition } onRepetitionChanged={this.repetitionChanged}/>
        <div className='actions'>
          <button onClick={() => this.buildMosaic()} disabled={!this.props.mosaicPreviewNeeded} >Générer l'aperçu</button>
          <button onClick={() => this.renderMosaic() } disabled={!this.props.serverRenderNeeded} >Créer ma mosaïque</button>
        </div>
      </div>
    );
  }
}

export default MosaicParameters