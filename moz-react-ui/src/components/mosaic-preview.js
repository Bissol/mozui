import React, { PureComponent } from 'react';
import './mosaic-preview.css';
import RangeCtrl from './rangeControl'
let ElementPan = require('react-element-pan');

class MosaicPreview extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {currentZoom : 5}
  }

  componentDidMount() {
    this.drawPreview()
  }

  componentDidUpdate() {
    this.drawPreview()
  }

  drawPreview() {
    const context = this.refs.canvas.getContext('2d')
    context.clearRect(0, 0, 2*this.props.width, 2*this.props.height)

    const vtr = [0, .1, .3, .5, .7, .9, 1.2, 1.5, 1.8, 2.5, 5]
    const scaleFactor = vtr[this.state.currentZoom]
    context.save()
    context.scale(scaleFactor, scaleFactor)

    if (this.props.previewData) {

      //let tileArray = this.props.previewData.data.map((e)=>(e.d))
      let tileArray = this.props.previewData.data
      let numCol = this.props.previewData.w
      let numRow = this.props.previewData.h
      let tileSize = this.props.width / numCol// numRow > numCol ? (this.props.width / numRow) : (this.props.height / numCol)
      tileSize = Math.round(tileSize)
      //console.log(`Width=${this.props.width} numCol=${numCol} numRow=${numRow} tileSize=${tileSize}`)

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

    context.restore()
  }

  // Display tile at given position in a canvas
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
      //console.log(f)
    }

    return Math.round(width * f)
  }

  setScale(v) {
    this.setState({currentZoom: v}, () => {
      this.drawPreview()
    })
  }

  render() {
    console.log(`Rendering mosaic preview (w=${this.props.width}, h=${this.props.height})`)
    
    return (
        <div>
          <RangeCtrl min={1} max={10} step={1} init={5} onNewValue={ (v) => this.setScale(v)} />
          <ElementPan>
            <canvas ref="canvas" className="MosaicPreviewCanvas" width={this.props.width} height={this.getHeight(this.props.width)}/>
          </ElementPan>
        </div>
    );
  }
}

export default MosaicPreview