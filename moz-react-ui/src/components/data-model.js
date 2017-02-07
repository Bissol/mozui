// Data model for the app component
// Responsible for server communication
require('whatwg-fetch')

class MosaicData {

  constructor(serverUrl) {
    this.target = undefined

    // Collections
    this.collectionMetadataUrl = serverUrl + 'php/collectionsDescription.json'
    this.collectionsMetadata = undefined
    this.collections = undefined
  }
 
  setTarget(path) {
    throw 'not implemented'
  }

  initializeCollections() {
  	return fetch(this.collectionMetadataUrl)
	  .then( (response) => {
	    return response.json()
	  }).then( (json) => {
	    console.log('parsed json', json)
	    let collections = json.collections
	    collections = collections.map( c => {c.checked = false; return c})
	    return this.collectionsMetadata = collections
	  }).catch(function(ex) {
	    console.log('parsing failed', ex)
	  })
  }

}

export default MosaicData