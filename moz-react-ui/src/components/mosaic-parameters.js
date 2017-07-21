import React, { PureComponent } from 'react';
import './mosaic-parameters.css';
import ParamMosaicSize from './param-mosaic-size.js';
import ParamAllowTileFlip from './param-allow-tile-flip.js';
import ParamDistance from './param-distance.js';
import ParamRepetition from './param-repetition.js';
import ParamEdges from './param-edges.js';
import ParamLuminosityCorrection from './param-luminosity-correction.js';

class MosaicParameters extends PureComponent {

  constructor(props) {
    super(props)

    this.mosaicSizeChanged = this.mosaicSizeChanged.bind(this)
    this.allowTileFlip = this.allowTileFlip.bind(this)
    this.distanceChanged = this.distanceChanged.bind(this)
    this.repetitionChanged = this.repetitionChanged.bind(this)
    this.edgesFactorChanged = this.edgesFactorChanged.bind(this)
    this.edgesMergeModeChanged = this.edgesMergeModeChanged.bind(this)
    this.luminosityCorrectionChanged = this.luminosityCorrectionChanged.bind(this)
    
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

  edgesFactorChanged(val) {
    let tmpState = this.state.parameters
    tmpState.edgesFactor = val
    this.setState({parameters: tmpState}, () => {
      localStorage.setItem('edgesFactor', val)
      this.props.onParametersChanged(this.state.parameters, 'edgesFactor')
    })
  }

  edgesMergeModeChanged(val) {
    let tmpState = this.state.parameters
    tmpState.edgesMergeMode = val
    this.setState({parameters: tmpState}, () => {
      localStorage.setItem('edgesMergeMode', val)
      this.props.onParametersChanged(this.state.parameters, 'edgesMergeMode')
    })
  }

  luminosityCorrectionChanged(val) {
    let tmpState = this.state.parameters
    tmpState.luminosityCorrection = val
    this.setState({parameters: tmpState}, () => {
      localStorage.setItem('luminosityCorrection', val)
      this.props.onParametersChanged(this.state.parameters, 'luminosityCorrection')
    })
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
    //console.log('Rendering mosaic parameters in ' + this.state.mode + ' mode')
     
    return (
      <div id="MosaicParametersDiv" className={this.props.mobileVisibility ? "mobileShow" : "mobileHide"}>
        <div className="param"><span>Mode simple</span><input type="checkbox" defaultChecked={this.state.mode === 'simple'} onChange={() => this.toggleMode()}/></div>
        <ParamMosaicSize mode={this.state.mode} value={parseInt(this.state.parameters.numColRow, 10)} onMosaicSizeChanged={this.mosaicSizeChanged}/>
        <ParamAllowTileFlip mode={this.state.mode} value={this.state.parameters.allowTileFlip} onAllowTileFlip={this.allowTileFlip} />
        <ParamDistance mode={this.state.mode} value={this.state.parameters.distance } onDistanceChanged={this.distanceChanged}/>
        <ParamRepetition mode={this.state.mode} value={this.state.parameters.repetition } onRepetitionChanged={this.repetitionChanged}/>
        <ParamEdges mode={this.state.mode}
                    edgesFactor={parseInt(this.state.parameters.edgesFactor,10) }
                    blendMode={this.state.parameters.edgesMergeMode}
                    onEdgesMergeModeChanged={this.edgesMergeModeChanged}
                    onEdgesFactorChanged={this.edgesFactorChanged}/>
        <ParamLuminosityCorrection mode={this.state.mode}
                    luminosityCorrection={parseInt(this.state.parameters.luminosityCorrection, 10) }
                    onLuminosityCorrectionChanged={this.luminosityCorrectionChanged} />
        <div className='actions'>
          <button onClick={() => this.buildMosaic()} disabled={!this.props.mosaicPreviewNeeded} >Générer l'aperçu</button>
          <button onClick={() => this.renderMosaic() } disabled={!this.props.serverRenderNeeded} >Créer ma mosaïque</button>
        </div>
      </div>
    );
  }
}

export default MosaicParameters