import React, { Component } from 'react';
import MosaicData from './components/data-model'
import CollectionPicker from './components/collection-picker'
import TargetImage from './components/target-image'
import MosaicParameters from './components/mosaic-parameters'
import MosaicPreview from './components/mosaic-preview'
import './App.css';

class App extends Component {

  constructor(props) {
    // non ui stuff creation
    super(props )
    this.data = new MosaicData('http://debarena.com/moz/')
    this.state = {
      collectionMetadata : this.data.collectionsMetadata,
       targetData : this.data.target,
       previewData : undefined
     }

    this.collectionChecked = this.collectionChecked.bind(this)
    this.targetImageChanged = this.targetImageChanged.bind(this)
    this.parametersChanged = this.parametersChanged.bind(this)
  }

  componentDidMount() {
    // server stuff & initializations
    this.data.initializeCollections().then( (metadata) =>  {
      this.setState({collectionMetadata: metadata})
      })
  }

  collectionChecked(collectionMetadata) {
    this.data.selectCollection(collectionMetadata).then( (collection) => {
      this.setState({collectionMetadata: this.data.collectionsMetadata})
      this.makeMosaic(true)
    })
  }

  targetImageChanged(imgData) {
    console.log('Target image changed')
    let done = () => {
      this.setState({targetData : this.data.target})
      this.makeMosaic(true)
    }
    this.data.setTarget(imgData, done)
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
      this.data.initMosaic().then( () => {
        this.makeMosaicPromise()
      })
    }
    else {
      this.makeMosaicPromise()
    }

    
  }

  makeMosaicPromise() {
    this.data.computeMosaic().then( 
      (compTime) => {
        console.log('Mosaic successfully generated')
        this.setState({ previewData : this.data.mosaic.result })
      }, 
      (err) => {
        console.error('Error while generating mosaic: ' + err)
      }
    )
  }

  render() {

    return (
      <div className="App">
        <MosaicParameters initialParameters={this.data.parameters} onParametersChanged={this.parametersChanged}/>
        <TargetImage targetImage={this.state.targetData} onTargetImageChanged={this.targetImageChanged}/>
        <MosaicPreview width={600} height={600} previewData={this.state.previewData}/>
        <CollectionPicker collections={this.state.collectionMetadata} onCollectionSelected={this.collectionChecked} />
      </div>
    )
  }

}

export default App;
