import React, { Component } from 'react';
import MosaicData from './components/data-model'
import CollectionPicker from './components/collection-picker'
import './App.css';

class App extends Component {

  constructor(props) {
    // non ui stuff creation
    super(props )
    this.data = new MosaicData('http://debarena.com/moz/')
    this.state = {collectionMetadata : this.data.collectionsMetadata}

    this.collectionChecked = this.collectionChecked.bind(this)
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

  render() {
    return (
      <div className="App">
        <CollectionPicker collections={this.state.collectionMetadata} onCollectionSelected={this.collectionChecked} />
      </div>
    )
  }

}

export default App;
