import React, { Component } from 'react'
import Measure from 'react-measure'
import MosaicData from './core/data-model'
import CollectionPicker from './components/collection-picker'
import TargetImage from './components/target-image'
import MosaicParameters from './components/mosaic-parameters'
import MosaicPreview from './components/mosaic-preview'
import MosaicLowRes from './components/mosaic-low-res'
import TabSwitch from './components/tabSwitch'
import Progress from './components/progress'
import Header from './components/header'
import './App.css';

class App extends Component {

  constructor(props) {
    // non ui stuff creation
    super(props )
    this.data = new MosaicData('http://debarena.com/moz/')
    this.state = {
      collectionMetadata : this.data.collectionsMetadata,
       targetData : this.data.target,
       previewData : undefined,
       edgeImage: undefined,
       currentTab: 'tab-target',
       busy: false,
       currentTask: "",
       progressPercent: 0,
       hidePercent : false,
       srcMosaicLowres : null,
       mosaicPreviewNeeded : false,
       serverRenderNeeded : false,
       tabViewDimensions: {width: -1,height: -1},
       mobileParametersVisible : false,
       blendMode: this.data.parameters.edgesMergeMode,
       luminosityCorrection : this.data.parameters.luminosityCorrection
     }

    this.collectionChecked = this.collectionChecked.bind(this)
    this.targetImageChanged = this.targetImageChanged.bind(this)
    this.parametersChanged = this.parametersChanged.bind(this)
    this.tabChanged = this.tabChanged.bind(this)
    this.makeMosaic = this.makeMosaic.bind(this)
    this.makePreview = this.makePreview.bind(this)
    this.renderMosaic = this.renderMosaic.bind(this)
    this.switchMobileParametersView = this.switchMobileParametersView.bind(this)
    this.addImageToMyCollection = this.addImageToMyCollection.bind(this)
    this.callbackProgress = this.callbackProgress.bind(this)
  }

  componentDidMount() {
    // server stuff & initializations
    this.data.initializeCollections().then( (metadata) =>  {
      this.setState({collectionMetadata: metadata})
      })
  }

  callbackProgress(percent, message) {
    this.setState({progressPercent : percent})
    if (message) this.setState({currentTask : message})
  }

  // ================================================ CHANGING COLLECTIONS ==================================================
  collectionChecked(collectionMetadata) {
    this.setState({hidePercent: false, busy : true, currentTask : "Chargement de la collection " + collectionMetadata.name_fr})
    this.data.selectCollection(collectionMetadata, this.callbackProgress).then( (collection) => {
      this.setState({collectionMetadata: this.data.collectionsMetadata, mosaicPreviewNeeded: this.data.isReadyForMakingPreview()})
      this.setState({busy : false})
    })
  }

  addImageToMyCollection(pixelData, img) {
    this.data.addImageToMyCollection(pixelData, img)
  }

  // ================================================ CHANGING TARGET IMAGE ============================================
  targetImageChanged(imgData) {
    console.log('Target image changed')
    this.setState({progressPercent : 0, hidePercent: false, busy : true, currentTask : "Traitement de l'image"})

    let done = () => {
      this.setState({targetData : this.data.target, mosaicPreviewNeeded: this.data.isReadyForMakingPreview()})
      this.setState({busy : false})
    }

    let callbackProgress = (percent) => {
      this.setState({progressPercent : percent})
    }

    this.data.setTarget(imgData, done, callbackProgress)
  }

  // ================================================ CHANGING PARAMS ==================================================
  parametersChanged(params, changedParam) {

    console.log('[App] Parameters changed:')
    console.log(params)
    this.data.parameters = params


    if (changedParam === 'numColRow') {
      this.setState({mosaicPreviewNeeded: this.data.isReadyForMakingPreview()})
      if (this.data.target) {
        this.data.mustReprocessTargetImage = true
      }
    }
    else if (changedParam === 'allowTileFlip') {
      this.setState({mosaicPreviewNeeded: this.data.isReadyForMakingPreview()})
      this.data.mustReindex = true
    }
    else if (changedParam === 'distance') {
      this.setState({mosaicPreviewNeeded: this.data.isReadyForMakingPreview()})
      this.data.mustReindex = true
    }
    else if (changedParam === 'repetition') {
      this.setState({mosaicPreviewNeeded: this.data.isReadyForMakingPreview()})
      this.data.mustReindex = true
    }
    else if (changedParam === 'edgesFactor') {
      this.setState({mosaicPreviewNeeded: this.data.isReadyForMakingPreview()})
      this.data.mustReprocessTargetImage = true
    }
    else if (changedParam === 'edgesMergeMode') {
      this.setState({blendMode: this.data.parameters.edgesMergeMode})
    }
    else if (changedParam === 'luminosityCorrection') {
      this.setState({luminosityCorrection: this.data.parameters.luminosityCorrection})
    }
  }

  makePreview() {
    console.log(`Launch preview. Analysis=${this.data.mustReprocessTargetImage}`)
    if (this.data.mustReprocessTargetImage) {
      this.setState({progressPercent : 0, hidePercent: false, busy : true, currentTask : "Analyse de l'image"})
      this.data.target.changeNumColRow(this.data.parameters.numColRow, this.callbackProgress).then( () => {
        this.data.mustReprocessTargetImage = false
        this.setState({busy : false})
        return this.makeMosaic()
      })
    }
    else {
      return this.makeMosaic()
    }
    
  }

  makeMosaic() {
    if (this.data.mustReindex === true) {
      this.setState({hidePercent: true, busy : true, currentTask : "Optimisation..."})
      this.data.initMosaic().then( () => {
        this.setState({busy : false, currentTask : "Optimisation terminée"})
        return this.makeMosaicPromise()
      }, () => {
        // Error
        this.setState({busy : false, currentTask : "Optimisation terminée"})
      })
    }
    else {
      return this.makeMosaicPromise()
    }
  }

  renderMosaic() {
    let clientSideRendering = true

    let progressCallback = (percent) => {
      this.setState({progressPercent : percent})
    }

    console.log('Server render launched')
    this.setState({hidePercent: !clientSideRendering, busy : true, currentTask : "Création de votre mosaïque"})
    this.data.renderLowResMosaic(true, progressCallback).then( (src) => {
      this.setState({srcMosaicLowres : src, busy : false, serverRenderNeeded: false})
    })
  }

  makeMosaicPromise() {

    let progressCallback = (percent) => {
      this.setState({progressPercent : percent})
    }

    this.setState({progressPercent : 0, hidePercent: false, busy : true, currentTask : "Génération de l'aperçu"})

    this.data.computeMosaic(progressCallback).then( 
      (compTime) => {
        this.setState({busy : false})
        console.log('Mosaic successfully generated')
        this.setState({ previewData : this.data.mosaic.result,
                        edgeImage: this.data.target.edgeImage,
                        previewTimestamp: Date.now(),
                        mosaicPreviewNeeded: false,
                        serverRenderNeeded: true })
      }, 
      (err) => {
        console.error('Error while generating mosaic: ' + err)
      }
    )
  }

  tabChanged(tid) {
    this.setState({ currentTab: tid}, () => {
      if (this.state.currentTab === 'tab-preview' && this.state.mosaicPreviewNeeded) {
        this.makePreview()
      }
      else if (this.state.currentTab === 'tab-lowres' && this.state.serverRenderNeeded) {
        this.renderMosaic()
      }
    })
  }

  switchMobileParametersView(visible) {
    this.setState({ mobileParametersVisible: visible})
  }

  render() {

    return (
      <div className="App" id="appMainContainer">
        <Progress hidePercent={this.state.hidePercent} busy={this.state.busy} message={this.state.currentTask} percent={this.state.progressPercent} />
        <Header onChangeDisplayVisibility={this.switchMobileParametersView} />
        <div id="mozaicAppView">
          <MosaicParameters 
            mobileVisibility={this.state.mobileParametersVisible}
            initialParameters={this.data.parameters} 
            onParametersChanged={this.parametersChanged} 
            onBuildMosaic={this.makePreview} 
            onRenderMosaic={this.renderMosaic} 
            serverRenderNeeded={this.state.serverRenderNeeded} 
            mosaicPreviewNeeded={this.state.mosaicPreviewNeeded}
          />
          <div id="tabView">
            <TabSwitch selectedTab={this.state.currentTab} onTabChanged={this.tabChanged} />
            <Measure onMeasure={(dimensions) => {
              this.setState({tabViewDimensions : {width:dimensions.width, height:dimensions.height}})
              //console.log(this.state.tabViewDimensions.width)
               }
            }>
              <div id="tabs">
                <div id="targetImage" className={this.state.currentTab === 'tab-target' ? 'shownTab' : 'hiddenTab'}>
                  <TargetImage targetImage={this.state.targetData} onTargetImageChanged={this.targetImageChanged}/>
                </div>
                <div id="selectCollections" className={this.state.currentTab === 'tab-collec' ? 'shownTab' : 'hiddenTab'}>
                  <CollectionPicker collections={this.state.collectionMetadata} onCollectionSelected={this.collectionChecked} addImageToMyCollection={this.addImageToMyCollection}/>
                </div>
                <div id="mosaicPreview" className={this.state.currentTab === 'tab-preview' ? 'shownTab' : 'hiddenTab'}>
                  <MosaicPreview 
                  width={this.state.tabViewDimensions.width}
                  height={this.state.tabViewDimensions.height}
                  previewData={this.state.previewData}
                  edgeImage={this.state.edgeImage}
                  blendMode={this.state.blendMode}
                  luminosityCorrection={this.state.luminosityCorrection}
                  previewTimestamp={this.state.previewTimestamp}
                  mosaicPreviewNeeded={this.state.mosaicPreviewNeeded}
                  onRefreshButton={this.makePreview}
                  />
                </div>
                <div id="mosaicLowres" className={this.state.currentTab === 'tab-lowres' ? 'shownTab' : 'hiddenTab'}>
                  <MosaicLowRes 
                    imageSrc={this.state.srcMosaicLowres} 
                    width={this.state.tabViewDimensions.width}
                    serverRenderNeeded={this.state.serverRenderNeeded} 
                  />
                </div>
              </div>
            </Measure>
          </div>
        </div>
      </div>
    )
  }

}

export default App;
