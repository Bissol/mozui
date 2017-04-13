import React, { Component } from 'react';
import './tabSwitch.css';

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
        <input className='state' type='radio' title='tab-collec' name='tabs-state' id='tab-collec' value='tab-collec' defaultChecked={this.props.selectedTab === 'tab-collec'} onChange={() => this.tabChanged('tab-collec')}/>
        <label htmlFor="tab-collec">Petites images</label>
        <input className='state' type='radio' title='tab-target' name='tabs-state' id='tab-target' value='tab-target' defaultChecked={this.props.selectedTab === 'tab-target'} onChange={() => this.tabChanged('tab-target')}/>
        <label htmlFor="tab-target">Image cible</label>
        <input className='state' type='radio' title='tab-preview' name='tabs-state' id='tab-preview' value='tab-preview' defaultChecked={this.props.selectedTab === 'tab-preview'} onChange={() => this.tabChanged('tab-preview')}/>
        <label htmlFor="tab-preview">Aperçu</label>
        <input className='state' type='radio' title='tab-lowres' name='tabs-state' id='tab-lowres' value='tab-lowres' defaultChecked={this.props.selectedTab === 'tab-lowres'} onChange={() => this.tabChanged('tab-lowres')}/>
        <label htmlFor="tab-lowres">Mosaïque</label>
        <input className='state' type='radio' title='tab-hd' name='tabs-state' id='tab-hd' value='tab-hd' defaultChecked={this.props.selectedTab === 'tab-hd'} onChange={() => this.tabChanged('tab-hd')}/>
        <label htmlFor="tab-hd">Mosaïque HD</label>
      </div>
    );
  }
}

export default TabSwitch