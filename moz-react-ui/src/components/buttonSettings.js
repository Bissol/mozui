import React, { Component } from 'react';

class ButtonSettings extends Component {

  constructor(props) {
    super(props)

    this.buttonPressed = this.buttonPressed.bind(this)

    this.state = {visible : false}
  }

  buttonPressed()
  {
    this.setState({visible : !this.state.visible})
    this.props.onChangeDisplayVisibility(this.state.visible)
  }

  render() {
    let Input = ''
    if (this.props.mode && this.props.mode === 'expert') {
      Input = <span>Autoriser : <input type='checkbox' ref='checkflip' defaultChecked={this.props.value} onChange={() => this.buttonPressed()} /></span>;
    }
    else {
      Input = <p>{this.props.value ? "Autorisé" : "Pas de retournement"}</p>
    }

    return (
      <div id="settingsVisibilitySwitch">
        <input type='button' ref='switch' checked={this.state.visible} onChange={() => this.buttonPressed()} >blahblah</button>
      </div>
    );
  }
}

export default ButtonSettings