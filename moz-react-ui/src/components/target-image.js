import React, { PureComponent } from 'react';
import './target-image.css';
import placeholderImg from '../../public/placeholder.jpg'

// Sample images
// import si_grenoble from '../../public/sample_images/logogrenoble.gif'
// import si_fille_nb from '../../public/sample_images/fille_nb.jpg'
// import si_femme_neige from '../../public/sample_images/femme_neige.jpg'
// import si_baby from '../../public/sample_images/baby.jpg'
// import si_old_man from '../../public/sample_images/oldman.jpg'
// import si_simpson from '../../public/sample_images/simpson.jpg'

require('whatwg-fetch')

class TargetImage extends PureComponent {

  constructor(props) {
    super(props )
    
    this.imageLoaded = this.imageLoaded.bind(this)
    this.state = {sampleImages: []}
  }

  componentDidMount() {
    fetch("http://funzaic.debarena.com/api/sample_images")
    .then( (response) => {
      return response.json()
    }).then( (json) => {
      //console.log('parsed json', json)
      this.setState({sampleImages: json})
    }).catch(function(ex) {
      console.error('JSON pourri : ', ex)
    })
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
    // pre-render sample images
    const listItems = this.state.sampleImages.map((item) =>
      <img width="80px" key={item.nid[0].value} src={item.field_image_exemple[0].url} alt={item.field_image_exemple[0].alt} onClick={() => this.props.onTargetImageChanged(item.field_image_exemple[0].url)} />
    );
    
    return (
      <div className="TargetImageDiv">
        <img src={this.props.targetImage ? this.props.targetImage.imageSrcData : placeholderImg} alt="La cible de ma mosaique !" className="TargetImage"/>
        <div id="filePicker">
          <label id="lblfile" htmlFor="filepkr">Choisissez une image</label><br/>
          <input ref="targetImageInput" id="filepkr" type="file" accept="image/*" onChange={ () => {this.targetChanged()} } />
        </div>
        <div className="SampleImagesContainer">
          {listItems}
        </div>
        
      </div>
    );
  }
}

export default TargetImage