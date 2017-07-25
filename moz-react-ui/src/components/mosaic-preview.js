import React, { PureComponent } from 'react';
import './mosaic-preview.css';
import placeholderImg from '../../public/Mosaic_wall.jpg'
import OpenSeaDragon from 'openseadragon'


class MosaicPreview extends PureComponent {

  constructor(props) {
    super(props)
    this.buttonPressed = this.buttonPressed.bind(this)
    this.intensityCorrection = this.props.intensityCorrection ? this.props.intensityCorrection : 0
    this.blendMode = this.props.blendMode ? this.props.blendMode : 'luminosity'

    this.canvas = document.createElement('canvas')

    this.viewer = undefined
    this.imgData = undefined
    this.ratio = this.props.height / this.props.width
  }

  componentDidMount() {

    this.viewer = OpenSeaDragon({
      id: "osdmozprev",
      prefixUrl: "",
      showNavigator:  true,
      tileSources: {
        type: 'image',
        url: this.imgData ? this.imgData : placeholderImg
      },
      debugMode: false,
    })
  }

  componentDidUpdate() {
    this.blendMode = this.props.blendMode ? this.props.blendMode : 'luminosity'
    this.drawPreview()
    this.viewer.open({
      type: 'image',
      url: this.imgData ? this.imgData : placeholderImg
    })
  }

  drawPreview() {
    console.log(`Drawing preview using ${this.blendMode} mode`)

    this.canvas.getContext('2d').clearRect(0, 0, 2*this.props.width, 2*this.props.height)

    this.canvas.getContext('2d').save()

    if (this.props.previewData) {

      //let tileArray = this.props.previewData.data.map((e)=>(e.d))
      let tileArray = this.props.previewData.data
      let numCol = this.props.previewData.w
      let numRow = this.props.previewData.h
      let tileSize = 25
      this.canvas.width = numCol * tileSize
      this.canvas.height = numRow * tileSize
      //tileSize = Math.round(tileSize)
      //console.log(`Width=${this.props.width} numCol=${numCol} numRow=${numRow} tileSize=${tileSize}`)

      for (var i=0; i<numCol; i++) {
        for (var j=0; j<numRow; j++) {
          const index = i + numCol*j
          let elem = tileArray[index]
          if (elem) {
            this.displayInCanvas(elem, this.canvas.getContext('2d'), i, j, tileSize)
          }
        }
      }

      // Draw edges
      if (this.props.edgeImage) {
        console.log(`edges ${numCol * tileSize},${numRow * tileSize}`)
        this.canvas.getContext('2d').save()
        this.canvas.getContext('2d').globalCompositeOperation = this.blendMode
        this.canvas.getContext('2d').drawImage(this.props.edgeImage, 0, 0, numCol * tileSize, numRow * tileSize)
        this.canvas.getContext('2d').restore()
      }

      this.imgData = this.canvas.toDataURL('image/jpeg', 0.6)
    }
    
    this.canvas.getContext('2d').restore()

    
  }

  // Display tile at given position in a canvas
  displayInCanvas(elem, ctx, i, j, size, txt) {
    if (!elem.d) return

    // Some useful comment
    const x = i * size
    const y = j * size
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
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.beginPath()
    ctx.rect(x, y, numColRow*subsize, numColRow*subsize)
    // let icc = elem.intensityCorrection > 0 ? 255 : 0
    let targetColor = elem.targetColor
    // let alpha = Math.abs(elem.intensityCorrection * (this.props.luminosityCorrection * 0.8)) / 255
    let alpha = this.props.luminosityCorrection / 12
    // ctx.fillStyle = `rgba(${icc}, ${icc}, ${icc}, ${alpha})`
    ctx.fillStyle = `rgba(${targetColor.r}, ${targetColor.g}, ${targetColor.b}, ${alpha})`
    ctx.fill()
    ctx.restore()
  }

  buttonPressed()
  {
    this.props.onRefreshButton()
  }

  render() {
    //<canvas ref="canvas" className="MosaicPreviewCanvas" width={this.props.width} height={this.getHeight(this.props.width)}/>
    let refreshButton = ''
    if (this.props.mosaicPreviewNeeded) {
      refreshButton = <input className='centerButton' type='button' onClick={() => this.buttonPressed()} value={"Mettre à jour"} />
    }

    return (
        <div>
            {refreshButton}
            <div id="osdmozprev" style={{width: this.props.width, height: this.props.width * this.ratio * .9}} ></div>
        </div>
    );
  }
}

export default MosaicPreview