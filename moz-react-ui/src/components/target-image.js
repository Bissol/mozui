import React, { PureComponent } from 'react';
import './target-image.css';

class TargetImage extends PureComponent {

  constructor(props) {
    super(props )
    
    this.imageLoaded = this.imageLoaded.bind(this)
  }

  imageLoaded(evt) {
    this.props.onTargetImageChanged(evt.target.result)
  }

  targetChanged() {
    if (this.refs.targetImageInput) {
      const selectedFile = this.refs.targetImageInput.files[0]
      if (selectedFile) {
        let reader = new FileReader();
        reader.onload = this.imageLoaded
        reader.readAsDataURL(selectedFile)
      }
    }
  }

  render() {
    console.log('Rendering target image (ready=' + (this.props.targetImage ? this.props.targetImage.ready : false) + ')')
    
    return (
      <div className="TargetImageDiv">
      <img src={this.props.targetImage ? this.props.targetImage.imageSrcData : '/placeholder.jpg'} alt="La cible de ma mosaique !" className="TargetImage"/>
        <div id="filePicker">
          <label id="lblfile" htmlFor="filepkr">Choisissez une image</label><br/>
          <input ref="targetImageInput" id="filepkr" type="file" accept="image/*" onChange={ () => {this.targetChanged()} } />
        </div>
        
      </div>
    );
  }
}

export default TargetImage