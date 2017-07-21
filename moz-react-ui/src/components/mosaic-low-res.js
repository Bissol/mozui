import React, { PureComponent } from 'react';
import './mosaic-low-res.css';
import placeholderImg from '../../public/placeholder.jpg'
import RangeCtrl from './rangeControl'
let ElementPan = require('react-element-pan');

class MosaicLowRes extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {currentZoom : 5}
    this.ratio = this.props.height / this.props.width
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

  render() {
    //console.log('Rendering mosaic (low resolution)')
    let refreshButton = ''
    if (this.props.serverRenderNeeded) {
      refreshButton = <input className='centerButton' type='button' onClick={() => this.buttonPressed()} value={"Mettre à jour"} />
    }

    return (
      <div id="MosaicLowResCont">
        <RangeCtrl min={1} max={10} step={1} init={5} onNewValue={ (v) => this.setScale(v)} />
        {refreshButton}
        <div id="panwrap">
          <ElementPan height={this.props.width * this.ratio * .8} >
            <img src={this.props.imageSrc ? this.props.imageSrc : placeholderImg} ref="hdmozimage" width={this.getWidth()} alt="Mosaique" className="mosaicImage"/>
          </ElementPan>
        </div>
      </div>
    );
  }
}

export default MosaicLowRes