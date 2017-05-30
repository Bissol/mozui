import React, { Component } from 'react';
import ButtonSettings from './buttonSettings'

class Header extends Component {

  // constructor(props) {
  //   super(props)
  // }

  render() {
    return (
      <div id="headerComponent">
        <ButtonSettings onChangeDisplayVisibility={this.props.onChangeDisplayVisibility}/>
      </div>
    );
  }
}

export default Header