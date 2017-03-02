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
    this.state = {collectionMetadata : this.data.collectionsMetadata, targetData : this.data.target}

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
    })
  }

  targetImageChanged(imgData) {
    console.log('Target image changed')
    let done = () => {this.setState({targetData : this.data.target})}
    this.data.setTarget(imgData, done)
  }

  parametersChanged(params, changedParam) {
    console.log('[App] Parameters changed:')
    console.log(params)
  }

  render() {

    return (
      <div className="App">
        <MosaicParameters onParametersChanged={this.parametersChanged}/>
        <TargetImage targetImage={this.state.targetData} onTargetImageChanged={this.targetImageChanged}/>
        <MosaicPreview width={300} height={300} />
        <CollectionPicker collections={this.state.collectionMetadata} onCollectionSelected={this.collectionChecked} />
      </div>
    )
  }

}

export default App;
