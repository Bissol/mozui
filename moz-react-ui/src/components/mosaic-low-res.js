import React, { PureComponent } from 'react';
import './mosaic-low-res.css';
import placeholderImg from '../../public/placeholder.jpg'
import OpenSeaDragon from 'openseadragon'

class MosaicLowRes extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {currentZoom : 5}
    this.ratio = this.props.height / this.props.width
    this.viewer = undefined
    this.image = document.createElement('img')
    this.dl_url = undefined
  }

  setScale(v) {
    this.setState({currentZoom: v}, () => {
      this.refs.hdmozimage.width = this.getWidth()
    })
  }

  getWidth() {
    const vtr = [0, .1, .3, .5, .7, .9, 1.2, 1.5, 1.8, 2.5, 5]
    return this.props.width * vtr[this.state.currentZoom]
  }

  buttonPressed()
  {
    this.props.onRefreshButton()
  }

  componentDidUpdate() {
    if (this.props.imageSrc) {
      this.image.onload = () => {
          this.refs.lnk.href = this.image.src
          this.viewer.open({
          type: 'image',
          url: this.props.imageSrc ? this.image.src : placeholderImg
        })
      }

      if (!HTMLCanvasElement.prototype.toBlob) {
        // prop is urldata
        this.image.src = this.props.imageSrc
        this.dl_url = this.props.imageSrc
      }
      else {
        // prop is a blob
        this.dl_url = URL.createObjectURL(this.props.imageSrc)
        this.image.src = this.dl_url
      }
    }
  }

  componentDidMount() {
    this.viewer = OpenSeaDragon({
      id: "osdmoz",
      prefixUrl: "/sites/default/files/mosaic/",
      showNavigator:  true,
      tileSources: {
        type: 'image',
        url: placeholderImg
      },
      debugMode: false,
    })

  }

  render() {
    // Download link
    //const dl_link = this.props.imageSrc ? <a href={this.props.imageSrc} download="mosaique.jpg">Télécharger</a> : ''
    const dl_link = this.props.imageSrc ? <a href={this.dl_url} download="mosaique.jpg" ref="lnk">Télécharger</a> : ''
   
    let refreshButton = ''
    if (this.props.serverRenderNeeded) {
      refreshButton = <input className='centerButton' type='button' onClick={() => this.buttonPressed()} value={"Mettre à jour"} />
    }

    return (
      <div id="MosaicLowResCont">
        {dl_link}
        <div id="osdmoz" style={{width: this.props.width, height: this.props.width * this.ratio * .9}} ></div>
        {refreshButton}
        
        
      </div>
    );
  }
}

export default MosaicLowRes