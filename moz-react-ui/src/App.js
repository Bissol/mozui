import React, { Component } from 'react';
import CollectionPicker from './components/collection-picker'
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <CollectionPicker />
      </div>
    );
  }
}

export default App;
