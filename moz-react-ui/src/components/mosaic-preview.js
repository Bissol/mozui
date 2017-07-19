import React, { PureComponent } from 'react';
import './mosaic-preview.css';
import RangeCtrl from './rangeControl'


class MosaicPreview extends PureComponent {

  constructor(props) {
    super(props)
    this.buttonPressed = this.buttonPressed.bind(this)

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
            this.displayInCanvas(elem, context, i, j, tileSize)
          }
        }
      }

    }

    // Draw edges
    if (this.props.edgeImage) {
      context.save()
      context.globalCompositeOperation = 'luminosity'
      context.drawImage(this.props.edgeImage, 0, 0, this.refs.canvas.width, this.refs.canvas.height)
      context.restore()
    }

    context.restore()
  }

  // Display tile at given position in a canvas
  displayInCanvas(elem, ctx, i, j, size, txt) {
    if (!elem.d) return

    // Some useful comment
    const x = Math.ceil(i * size)
    const y = Math.ceil(j * size)
    const numColRow = Math.sqrt(elem.d.nbsub)
    var subsize = Math.round(size / numColRow)

   // Draw tile
    for (var si=0; si<numColRow; si++)
    {
      for (var sj=0; sj<numColRow; sj++)
        {
          ctx.beginPath()
          ctx.rect(x + si*subsize, y + sj*subsize, subsize, subsize)
          const col = elem.d.colors[si*numColRow + sj]
          ctx.fillStyle = "rgba("+col.r+", "+col.g+", "+col.b+", 1)"
          ctx.fill()
        }
    }

    // Apply intensity correction
    ctx.beginPath()
    ctx.rect(x, y, numColRow*subsize, numColRow*subsize)
    let icc = elem.intensityCorrection > 0 ? 255 : 0
    let alpha = Math.abs(elem.intensityCorrection) / 255
    console.log(`Correction: ${elem.intensityCorrection} -> Color ${icc} alpha: ${alpha}`)
    ctx.fillStyle = `rgba(${icc}, ${icc}, ${icc}, ${alpha})`
    ctx.fill()
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

  buttonPressed()
  {
    this.props.onRefreshButton()
  }

  render() {
    console.log(`Rendering mosaic preview (w=${this.props.width}, h=${this.props.height})`)
    let refreshButton = ''
    if (this.props.mosaicPreviewNeeded) {
      refreshButton = <input className='centerButton' type='button' onClick={() => this.buttonPressed()} value={"Mettre à jour"} />
    }

    return (
        <div>
          <RangeCtrl min={1} max={10} step={1} init={5} onNewValue={ (v) => this.setScale(v)} />
            {refreshButton}
            <canvas ref="canvas" className="MosaicPreviewCanvas" width={this.props.width} height={this.getHeight(this.props.width)}/>
        </div>
    );
  }
}

export default MosaicPreview