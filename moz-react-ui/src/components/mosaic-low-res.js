import React, { PureComponent } from 'react';
import './mosaic-low-res.css';

class MosaicLowRes extends PureComponent {

  render() {
    console.log('Rendering mosaic (low resolution)')
    
    return (
      <div className="MosaicLowRes">
        <img src={this.props.imageSrc ? this.props.imageSrc : '/placeholder.jpg'} alt="Mosaique" className="mosaicImage"/>
      </div>
    );
  }
}

export default MosaicLowRes