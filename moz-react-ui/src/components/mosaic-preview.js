import React, { Component } from 'react';
import './mosaic-preview.css';

class MosaicPreview extends Component {

  componentDidMount() {
    this.drawPreview()
  }

  componentDidUpdate() {
    this.drawPreview()
  }

  drawPreview() {
    const context = this.refs.canvas.getContext('2d')
    context.save();
    context.translate(100, 100);
    context.rotate(this.props.rotation, 100, 100);
    context.fillStyle = '#F00';
    context.fillRect(-50, -50, 100, 100);
    context.restore();
  }

  render() {
    console.log('Rendering mosaic preview')
    
    return (
      <canvas ref="canvas" className="MosaicPreviewCanvas" width={this.props.width} height={this.props.height}/>
    );
  }
}

export default MosaicPreview