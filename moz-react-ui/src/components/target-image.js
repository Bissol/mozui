import React, { PureComponent } from 'react';
import './target-image.css';
import placeholderImg from '../../public/placeholder.jpg'
require('whatwg-fetch')

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
      if (window.FileReader) {
        const selectedFile = this.refs.targetImageInput.files[0]
        if (selectedFile) {
          let reader = new FileReader();
          reader.onload = this.imageLoaded
          reader.readAsDataURL(selectedFile)
        }
      }
      else {
        // Filereader not available
        alert(`Désolé, votre navigateur n'est pas compatible. (Filereader non disponible)`)
        // console.log(`filereader not available.`)
        // var data = new FormData()
        // data.append('file', this.refs.targetImageInput.files[0])
        // console.log(data)

        // fetch('http://www.debarena.com/moz/php/echo_back.php', {
        //   method: 'POST',
        //   body: data
        // }).then (response => {
        //   if (response.status === 200) {
        //     return response
            
        //   }
        //   else {
        //     alert('Lol! Server error')
        //   }
        // }).then(res => res.text())
        // .then( res => {
        //   console.log(res)
        //   this.props.onTargetImageChanged(res)
        // })

      }
    }
  }

  render() {
    console.log('Rendering target image (ready=' + (this.props.targetImage ? this.props.targetImage.ready : false) + ')')
    
    return (
      <div className="TargetImageDiv">
      <img src={this.props.targetImage ? this.props.targetImage.imageSrcData : placeholderImg} alt="La cible de ma mosaique !" className="TargetImage"/>
        <div id="filePicker">
          <label id="lblfile" htmlFor="filepkr">Choisissez une image</label><br/>
          <input ref="targetImageInput" id="filepkr" type="file" accept="image/*" onChange={ () => {this.targetChanged()} } />
        </div>
        
      </div>
    );
  }
}

export default TargetImage