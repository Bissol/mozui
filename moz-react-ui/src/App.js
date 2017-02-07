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
  }

  componentDidMount() {
    // server stuff & initializations
    this.data.initializeCollections().then( (metadata) =>  {
      this.setState({collectionMetadata: metadata})
      console.log('ok')
      })
  }

  render() {
    return (
      <div className="App">
        <CollectionPicker collections={this.state.collectionMetadata}/>
      </div>
    )
  }

}

export default App;
