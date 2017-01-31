import React, { Component } from 'react';
import MosaicData from './components/data-model'
import CollectionPicker from './components/collection-picker'
import './App.css';

class App extends Component {

  constructor(props) {
    super(props )
    this.data = new MosaicData()
    //this.state =
  }

  componentDidMount() {

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
