import React, { Component } from 'react';
import MosaicData from './components/data-model'
import CollectionPicker from './components/collection-picker'
import './App.css';

class App extends Component {

  constructor(props) {
    // non ui stuff creation
    super(props )
    this.data = new MosaicData('http://debarena.com/moz/')
    //this.state =
  }

  componentDidMount() {
    // server stuff & initializations
    this.data.initializeCollections()
  }

  render() {
    return (
      <div className="App">
        <CollectionPicker />
      </div>
    )
  }

}

export default App;
