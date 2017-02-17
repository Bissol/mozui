// Data model for the app component
// Responsible for server communication
require('whatwg-fetch')
import { loadCollectionJson } from '../core/collectionLoader'

class MosaicData {

  constructor(serverUrl) {
    this.target = undefined

    // Collections
    this.collectionMetadataUrl = serverUrl + 'php/collectionsDescription.json'
    this.collectionsMetadata = undefined
    this.collections = []
  }
 
  setTarget(path) {
    alert('todo')
  }

  initializeCollections() {
  	return fetch(this.collectionMetadataUrl)
	  .then( (response) => {
	    return response.json()
	  }).then( (json) => {
	    //console.log('parsed json', json)
	    let collections = json.collections
	    collections = collections.map( c => {c.checked = false; c.loaded = false; return c})
	    return this.collectionsMetadata = collections
	  }).catch(function(ex) {
	    console.log('parsing failed', ex)
	  })
  }

  selectCollection(collectionMetadata) {
  	return new Promise( (resolve, reject) => {
  		if (collectionMetadata.loaded) {
  			resolve(this.collections[collectionMetadata.dir])
  		}

	  	loadCollectionJson(collectionMetadata.dir, (res) => {
	  		collectionMetadata.loaded = true
	  		collectionMetadata.checked = true
		  	this.collections[collectionMetadata.dir] = res
		  	resolve(this.collections[collectionMetadata.dir])})
	})
  }

}

export default MosaicData