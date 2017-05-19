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
      Input = <span>Autoriser : <input type='checkbox' ref='checkflip' defaultChecked={this.props.value} onChange={() => this.paramChanged()} /></span>;
    }
    else {
      Input = <p>{this.props.value ? "Autorisé" : "Pas de retournement"}</p>
    }

    return (
      <div className='ParamAllowTileFlip param'>
        <p className="paramTitle">Retournement des tuiles</p>
        {Input}
      </div>
    );
  }
}

export default ParamAllowTileFlip