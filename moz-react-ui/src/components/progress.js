import React, { Component } from 'react';
import './progress.css';
import gifImg from '../../public/squares.gif'

class Progress extends Component {

  render() {
    let Meter
    if (!this.props.hidePercent) {
      Meter = <meter className="meter" min="0" low="33" high="95" max="100" value={this.props.percent} />
    }
    return (
      <div className={this.props.busy ? 'busy' : 'idle'} id='Progress'>
      	<div className='progressInfo'>
	        <div id="squareGifWrapper"><img id="squareGif" src={gifImg} alt="ça bosse !" /></div>
	        <p>{this.props.message}{this.props.hidePercent ? '' : ` (${this.props.percent}%)`}</p>
          {Meter}
	     </div>
      </div>
    );
  }
}

export default Progress