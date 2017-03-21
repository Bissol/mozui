import React, { Component } from 'react';

class ParamAllowTileFlip extends Component {

  constructor(props) {
    super(props)

    this.paramChanged = this.paramChanged.bind(this)
  }

  paramChanged()
  {
    let val = this.refs.checkflip.checked
    this.props.onAllowTileFlip(val)
  }

  render() {
    let Input = ''
    if (this.props.mode && this.props.mode === 'expert') {
      Input = <span>Autoriser le retournement des images <input type='checkbox' ref='checkflip' defaultChecked={this.props.value} onChange={() => this.paramChanged()} /></span>;
    }

    return (
      <div className='ParamAllowTileFlip'>
        {Input}
      </div>
    );
  }
}

export default ParamAllowTileFlip