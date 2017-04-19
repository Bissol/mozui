import React, { PureComponent } from 'react';
import './mosaic-low-res.css';
import placeholderImg from '../../public/placeholder.jpg'

class MosaicLowRes extends PureComponent {

  render() {
    console.log('Rendering mosaic (low resolution)')
    
    return (
      <div className="MosaicLowRes">
        <img src={this.props.imageSrc ? this.props.imageSrc : placeholderImg} alt="Mosaique" className="mosaicImage"/>
      </div>
    );
  }
}

export default MosaicLowRes