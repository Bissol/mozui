import React, { PureComponent } from 'react';
import './mosaic-preview.css';

class MosaicPreview extends PureComponent {

  componentDidMount() {
    this.drawPreview()
  }

  componentDidUpdate() {
    this.drawPreview()
  }

  drawPreview() {
    const context = this.refs.canvas.getContext('2d')
    context.clearRect(0, 0, this.props.width, this.props.height)

    if (this.props.previewData) {

      //let tileArray = this.props.previewData.data.map((e)=>(e.d))
      let tileArray = this.props.previewData.data
      let numCol = this.props.previewData.w
      let numRow = this.props.previewData.h
      let tileSize = numRow > numCol ? (this.props.width / numRow) : (this.props.height / numCol)
      tileSize = Math.round(tileSize)

      for (var i=0; i<numCol; i++) {
        for (var j=0; j<numRow; j++) {
          let tile = tileArray[i + numCol*j].d
          let flipped = tileArray[i + numCol*j].f
          this.displayInCanvas(tile, context, i, j, tileSize)
        }
      }

    }
  }

  // Display server tile at given position in a canvas
  displayInCanvas(tile, ctx, i, j, size, txt) {
    if (!tile) return

    const x = Math.ceil(i * size)
    const y = Math.ceil(j * size)
    const numColRow = Math.sqrt(tile.nbsub)
    var subsize = Math.round(size / numColRow)
    for (var si=0; si<numColRow; si++)
      {
        for (var sj=0; sj<numColRow; sj++)
          {
            ctx.beginPath()
            ctx.rect(x + si*subsize, y + sj*subsize, subsize, subsize)
            const col = tile.colors[si*numColRow + sj]
            ctx.fillStyle = "rgba("+col.r+", "+col.g+", "+col.b+", 1)"
            ctx.fill()
          }
      }
  }

  render() {
    console.log('Rendering mosaic preview')
    
    return (
        <canvas ref="canvas" className="MosaicPreviewCanvas" width={this.props.width} height={this.props.height}/>
    );
  }
}

export default MosaicPreview