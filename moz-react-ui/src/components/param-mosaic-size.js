import React, { Component } from 'react';

class ParamMosaicSize extends Component {

  constructor(props) {
    super(props)

    this.SMALL_MOZAIC = 20
    this.AVERAGE_MOZAIC = 40
    this.LARGE_MOZAIC = 60

    this.timeout = null
    this.paramChanged = this.paramChanged.bind(this)

    if (this.props.mode === 'simple' && (this.props.value !== this.SMALL_MOZAIC && this.props.value !== this.AVERAGE_MOZAIC && this.props.value !== this.LARGE_MOZAIC)) {
      this.paramChanged(this.AVERAGE_MOZAIC)
    }
  }

  paramChanged(val)
  {
    if (!val) {
      clearTimeout(this.timeout)
      this.timeout = setTimeout( () => {
          this.props.onMosaicSizeChanged(this.refs.expertSize.value)
      }, 700)
    }
    else
    {
      this.props.onMosaicSizeChanged(val)
    }
  }

  render() {
    let Input = ''
    if (this.props.mode && this.props.mode === 'expert') {
      Input = <span><input type='number' min='10' max='80' defaultValue={this.props.value} ref='expertSize' onChange={() => this.paramChanged()}/> tuiles sur bord long</span>;
    }
    else if (this.props.mode === 'simple') {
      Input = <span><input type="radio" name="simpleSize" value={this.SMALL_MOZAIC} defaultChecked={this.props.value === this.SMALL_MOZAIC} onChange={() => this.paramChanged(this.SMALL_MOZAIC)}/><span>petit</span>
                    <input type="radio" name="simpleSize" value={this.AVERAGE_MOZAIC} defaultChecked={this.props.value === this.AVERAGE_MOZAIC} onChange={() => this.paramChanged(this.AVERAGE_MOZAIC)} /><span>moyen</span>
                    <input type="radio" name="simpleSize" value={this.LARGE_MOZAIC} defaultChecked={this.props.value === this.LARGE_MOZAIC} onChange={() => this.paramChanged(this.LARGE_MOZAIC)} /><span>grand</span></span>
    }
    else {console.error('Bad mode')}

    return (
      <div className='ParamMosaicSize'>
        Taille : {Input}
      </div>
    );
  }
}

export default ParamMosaicSize