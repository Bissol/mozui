import React, { PureComponent } from 'react';

class MyCollection extends PureComponent {

constructor(props) {
	super(props)

	this.imageLoaded = this.imageLoaded.bind(this)

	this.state = {loadedImages : []}
}

imageLoaded(file) {
	let reader = new FileReader()
	// Return promise
	return new Promise( (resolve, reject) => {
		reader.onload =  (event) => {
	      this.resizeInCanvas(event.target.result).then(resolve)
	    }
	    reader.readAsDataURL(file)
	})
}

imagesAdded() {
	if (this.refs.multi_img_upload_ref) {
	  if (window.FileReader) {
		for (let i=0; i<this.refs.multi_img_upload_ref.files.length; i++) {
			this.imageLoaded(this.refs.multi_img_upload_ref.files[i]).then( res => {
				this.setState((prevState) => {
					return {loadedImages: prevState.loadedImages.concat(res) }
				})
			})
		}

	
	  	// for (let i=0; i<tmparr.length; i++) {

	  	// }

	  // 	Promise.all(tmparr.map(this.imageLoaded)).then( values => {
	  // 		this.setState((prevState) => {
	  // 			console.log(`${values.length} images added`)
			//   return {loadedImages: prevState.loadedImages.concat(values) }
			// })
	  // 	})
	  }
	  else {
	  	alert(`Navigateur non compatible (fileReader)`)
	  }
	}
}

resizeInCanvas(urldata) {
	let canvas = document.createElement("canvas")
	let img = new Image();
	canvas.width = 150
	canvas.height = 150
	return new Promise( (resolve, reject) => {
		img.onload = () => {
			canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    		canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)

    		// Send pixel data for avg extraction
    		this.props.addImageToMyCollection(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height))

    		resolve(canvas.toDataURL("image/png"))
		}

		img.src = urldata
	})
}

// shrink(dataurl_array) {
	

// 	Promise.all( dataurl_array.map(durl => this.resizeInCanvas(img, canvas, durl))).then( shrunk_images => {
		
// 	})
// }

render() {
	let count = 0
	let images = this.state.loadedImages.map( urldata => {
		count++
		return <img src={urldata} alt='usrimg' key={count} />
	})
	return (
	  <div className="MyCollection">
	    <p>{this.props.collectionName} ({this.state.loadedImages.length === 0 ? "vide" : this.state.loadedImages.length === 1 ? "Une image" : this.state.loadedImages.length + " images"}) </p>
	    <label id="lblfile" htmlFor="multi_img_upload">Ajoutez des images</label>
	    <input ref="multi_img_upload_ref" id="multi_img_upload" multiple type="file" accept="image/*" onChange={ () => {this.imagesAdded()} } />
	    <ul>{images}</ul>
	  </div>
	);
	}
}

export default MyCollection