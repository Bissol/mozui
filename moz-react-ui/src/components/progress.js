import React, { Component } from 'react';
import './progress.css';

class Progress extends Component {

  render() {
    
    return (
      <div className={this.props.busy ? 'busy' : 'idle'} id='Progress'>
        <img src='/squares.gif' />
        <p>{this.props.message}</p>
      </div>
    );
  }
}

export default Progress