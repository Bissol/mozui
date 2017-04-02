import React, { Component } from 'react';
import MosaicData from './components/data-model'
import CollectionPicker from './components/collection-picker'
import TargetImage from './components/target-image'
import MosaicParameters from './components/mosaic-parameters'
import MosaicPreview from './components/mosaic-preview'
import MosaicLowRes from './components/mosaic-low-res'
import TabSwitch from './components/tabSwitch'
import Progress from './components/progress'
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
       currentTab: 'tab-target',
       busy: false,
       currentTask: "",
       progressPercent: 0,
       hidePercent : false,
       srcMosaicLowres : null
     }

    this.collectionChecked = this.collectionChecked.bind(this)
    this.targetImageChanged = this.targetImageChanged.bind(this)
    this.parametersChanged = this.parametersChanged.bind(this)
    this.tabChanged = this.tabChanged.bind(this)
  }

  componentDidMount() {
    // server stuff & initializations
    this.data.initializeCollections().then( (metadata) =>  {
      this.setState({collectionMetadata: metadata})
      })
  }

  collectionChecked(collectionMetadata) {
    this.setState({hidePercent: true, busy : true, currentTask : "Chargement de la collection " + collectionMetadata.name_fr})
    this.data.selectCollection(collectionMetadata).then( (collection) => {
      this.setState({collectionMetadata: this.data.collectionsMetadata})
      this.setState({busy : false})
      this.makeMosaic(true)
    })
  }

  targetImageChanged(imgData) {
    console.log('Target image changed')
    this.setState({progressPercent : 0, hidePercent: false, busy : true, currentTask : "Traitement de l'image"})

    let done = () => {
      this.setState({targetData : this.data.target})
      this.setState({busy : false})
      this.makeMosaic(true)
    }

    let callbackProgress = (percent) => {
      this.setState({progressPercent : percent})
    }

    this.data.setTarget(imgData, done, callbackProgress)
  }

  parametersChanged(params, changedParam) {
    console.log('[App] Parameters changed:')
    console.log(params)
    this.data.parameters = params

    if (changedParam === 'numColRow') {
      if (this.data.target) this.data.target.changeNumColRow(params.numColRow).then( () => {this.makeMosaic(true)})
    }
    else if (changedParam === 'allowTileFlip') {
      this.makeMosaic(true)
    }
  }

  makeMosaic(init) {

    if (init) {
      this.setState({hidePercent: true, busy : true, currentTask : "Optimisation..."})
      this.data.initMosaic().then( () => {
        this.setState({busy : false, currentTask : "Optimisation terminée"})
        this.makeMosaicPromise()
      }, () => {
        this.setState({busy : false, currentTask : "Optimisation terminée"})
      })
    }
    else {
      this.makeMosaicPromise()
    }

    
  }

  makeMosaicPromise() {

    let progressCallback = (percent) => {
      this.setState({progressPercent : percent})
    }

    this.setState({progressPercent : 0, hidePercent: false, busy : true, currentTask : "Création de la mosaïque"})

    this.data.computeMosaic(progressCallback).then( 
      (compTime) => {
        this.setState({busy : false})
        console.log('Mosaic successfully generated')
        this.setState({ previewData : this.data.mosaic.result })
      }, 
      (err) => {
        console.error('Error while generating mosaic: ' + err)
      }
    )
  }

  tabChanged(tid) {
    this.setState({ currentTab: tid})

    // If user selects mosaic tab, generate it!
    if (tid ==='tab-lowres') {
      console.log('Server render launched')
      this.data.renderLowResMosaic().then( (src) => {
        this.setState({srcMosaicLowres : src})
      })
    }
  }

  render() {

    return (
      <div className="App" id="appMainContainer">
        <Progress hidePercent={this.state.hidePercent} busy={this.state.busy} message={this.state.currentTask} percent={this.state.progressPercent} />
        <MosaicParameters initialParameters={this.data.parameters} onParametersChanged={this.parametersChanged}/>
        <CollectionPicker collections={this.state.collectionMetadata} onCollectionSelected={this.collectionChecked} />
        <TabSwitch selectedTab={this.state.currentTab} onTabChanged={this.tabChanged} />
        <div id="tabs">
          <div id="targetImage" className={this.state.currentTab === 'tab-target' ? 'shownTab' : 'hiddenTab'}>
            <TargetImage targetImage={this.state.targetData} onTargetImageChanged={this.targetImageChanged}/>
          </div>
          <div id="mosaicPreview" className={this.state.currentTab === 'tab-preview' ? 'shownTab' : 'hiddenTab'}>
            <MosaicPreview width={800} height={600} previewData={this.state.previewData}/>
          </div>
          <div id="mosaicLowres" className={this.state.currentTab === 'tab-lowres' ? 'shownTab' : 'hiddenTab'}>
            <MosaicLowRes imageSrc={this.state.srcMosaicLowres} />
          </div>
        </div>
        
      </div>
    )
  }

}

export default App;
