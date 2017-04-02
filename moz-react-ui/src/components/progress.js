import React, { Component } from 'react';
import './progress.css';

class Progress extends Component {

  render() {
    
    return (
      <div className={this.props.busy ? 'busy' : 'idle'} id='Progress'>
      	<div className='progressInfo'>
	        <img src='/squares.gif' />
	        <p>{this.props.message}</p>
	        <p className={this.props.hidePercent ? 'percentHidden' : 'percentShown'}>{this.props.percent}%</p>
	     </div>
      </div>
    );
  }
}

export default Progress