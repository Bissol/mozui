import React, { Component } from 'react';

class ButtonSettings extends Component {

  constructor(props) {
    super(props)

    this.buttonPressed = this.buttonPressed.bind(this)

    this.state = {visible : false}
  }

  buttonPressed()
  {
    let b = this.state.visible
    this.setState({visible : !b}, () => {
      this.props.onChangeDisplayVisibility(this.state.visible)
    })
  }

  render() {
    return (
      <div id="settingsVisibilitySwitch">
        <input type='button' onClick={() => this.buttonPressed()} value={this.state.visible ? "Cacher les paramètres" : "Montrer les paramètres"} />
      </div>
    );
  }
}

export default ButtonSettings