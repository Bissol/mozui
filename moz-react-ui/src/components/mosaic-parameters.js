import React, { Component } from 'react';
import './mosaic-parameters.css';

class MosaicParameters extends Component {

  constructor(props) {
    super(props)

    const numColRow_DEFAULT = 50
    
    this.mode = 'simple'
    this.parameters = {}
    this.parameters.numColRow = localStorage.getItem('numColRow') ? localStorage.getItem('numColRow') : numColRow_DEFAULT
  }

  render() {
    console.log('Rendering mosaic parameters')
    
    return (
      <div className="MosaicParametersDiv">
        
      </div>
    );
  }
}

export default MosaicParameters