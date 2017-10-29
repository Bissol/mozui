/*
  Expected props
  - mode
  - tileSize
  - onTileSizeChanged
*/

import React, { Component } from 'react';
import LessMoreControl from './less-more-ctrl'

class ParamTileSize extends Component {

  constructor(props) {
    super(props)
    this.val2txt = { 
      0: `50x50 : Très petites vignettes. Adapté aux smartphones peu puissants.`,
      1: `75x75 : Petites vignettes mais plus rapide à générer.`,
      2: `100x100 : Vignettes de taille moyenne.`,
      3: `125x125 : Assez grandes vignettes. Nécessite un bon smartphone ou un ordinateur.`,
      4: `150x150 : Grandes vignettes, grande mosaïque finale. Nécessite un bon smartphone ou un ordinateur.`
    }

    this.PRECISION = 5

    this.state = {value: this.props.tileSize}

    this.tileSizeChanged = this.tileSizeChanged.bind(this)
  }

  
  tileSizeChanged(val)
  {
    this.setState({value: val})
    this.props.onTileSizeChanged(val)
  }

  render() {
    let Input = ''
    if (this.props.mode && this.props.mode === 'expert') {
      Input = <LessMoreControl value={this.state.value} nbValues={this.PRECISION} onValueChanged={this.tileSizeChanged} />
    }
    else if (this.props.mode === 'simple') {
      Input = ''
    }
    else {console.error('Bad mode')}

    return (
      <div className='ParamTileSize param'>
      <p className="paramTitle">Taille des vignettes</p>
      {Input}
      <p>{this.val2txt[Math.floor(this.state.value * (Object.keys(this.val2txt).length / this.PRECISION))]}</p>
      </div>
    );
  }
}

export default ParamTileSize