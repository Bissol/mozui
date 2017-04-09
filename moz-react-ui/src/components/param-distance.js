import React, { Component } from 'react';

class ParamDistance extends Component {

  constructor(props) {
    super(props)

    this.paramChanged = this.paramChanged.bind(this)
  }

  paramChanged()
  {
    let val = this.refs.distance.value
    this.props.onDistanceChanged(val)
  }

  render() {
    let Input = ''
    if (this.props.mode && this.props.mode === 'expert') {
      Input = <input type='range' ref='distance' defaultValue={this.props.value} onChange={() => this.paramChanged()} />;
    }

    return (
      <div className='ParamDistance'>
        {Input}
      </div>
    );
  }
}

export default ParamDistance