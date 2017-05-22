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
      let tileSize = this.props.width / numCol// numRow > numCol ? (this.props.width / numRow) : (this.props.height / numCol)
      tileSize = Math.round(tileSize)
      console.log(`Width=${this.props.width} numCol=${numCol} numRow=${numRow} tileSize=${tileSize}`)

      for (var i=0; i<numCol; i++) {
        for (var j=0; j<numRow; j++) {
          const index = i + numCol*j
          let elem = tileArray[index]
          if (elem) {
            let tile = elem.d
            this.displayInCanvas(tile, context, i, j, tileSize)
          }
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

  getHeight(width) {
    let f = 1
    if (this.props.previewData) {
      f = this.props.previewData.h / this.props.previewData.w
      console.log(f)
    }

    return Math.round(width * f)
  }

  render() {
    console.log(`Rendering mosaic preview (w=${this.props.width}, h=${this.props.height})`)
    
    return (
        <canvas ref="canvas" className="MosaicPreviewCanvas" width={this.props.width} height={this.getHeight(this.props.width)}/>
    );
  }
}

export default MosaicPreview