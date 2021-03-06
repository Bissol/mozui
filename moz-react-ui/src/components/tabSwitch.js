import React, { Component } from 'react';
import './tabSwitch.css';
import tilesImg from '../../public/tiles.png'
import portraitImg from '../../public/portrait.png'
import previewImg from '../../public/preview.png'
import mosaicImg from '../../public/mosaic.png'
import hdmosaicImg from '../../public/hdmosaic.png'

class TabSwitch extends Component {

  constructor(props) {
    super(props)

    this.tabChanged = this.tabChanged.bind(this)
  }

  tabChanged(tid)
  {
    this.props.onTabChanged(tid)
  }

  render() {
    
    return (
      <div id='TabSwitch'>
        <input className='state' type='radio' title='tab-target' name='tabs-state' id='tab-target' value='tab-target' defaultChecked={this.props.selectedTab === 'tab-target'} onChange={() => this.tabChanged('tab-target')}/>
        <label htmlFor="tab-target"><img src={portraitImg} alt='tuile' className='tabswitchicon' /><span>Image</span></label>
        <input className='state' type='radio' title='tab-collec' name='tabs-state' id='tab-collec' value='tab-collec' defaultChecked={this.props.selectedTab === 'tab-collec'} onChange={() => this.tabChanged('tab-collec')}/>
        <label htmlFor="tab-collec"><img src={tilesImg} alt='tuile' className='tabswitchicon' /><span>Vignettes</span></label>
        <input className='state' type='radio' title='tab-preview' name='tabs-state' id='tab-preview' value='tab-preview' defaultChecked={this.props.selectedTab === 'tab-preview'} onChange={() => this.tabChanged('tab-preview')}/>
        <label htmlFor="tab-preview"><img src={previewImg} alt='tuile' className='tabswitchicon' /><span>Aperçu</span></label>
        <input className='state' type='radio' title='tab-lowres' name='tabs-state' id='tab-lowres' value='tab-lowres' defaultChecked={this.props.selectedTab === 'tab-lowres'} onChange={() => this.tabChanged('tab-lowres')}/>
        <label htmlFor="tab-lowres"><img src={mosaicImg} alt='tuile' className='tabswitchicon' /><span>Mosaïque</span></label>
        <input className='state' type='radio' title='tab-hd' name='tabs-state' id='tab-hd' value='tab-hd' defaultChecked={this.props.selectedTab === 'tab-hd'} onChange={() => this.tabChanged('tab-hd')}/>
        <label htmlFor="tab-hd"><img src={hdmosaicImg} alt='tuile' className='tabswitchicon' /><span>MosaGIF</span></label>
      </div>
    );
  }
}

export default TabSwitch