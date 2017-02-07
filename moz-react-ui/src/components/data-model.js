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
  	fetch(this.collectionMetadataUrl)
	  .then(function(response) {
	    return response.json()
	  }).then(function(json) {
	    console.log('parsed json', json)
	  }).catch(function(ex) {
	    console.log('parsing failed', ex)
	  })
  }

}

export default MosaicData