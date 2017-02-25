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

  // Toggle selection + loads collection from server if necessary
  selectCollection(collectionMetadata) {
  	return new Promise( (resolve, reject) => {
  		if (collectionMetadata.checked)
  		{
  			// Unselect (already loaded)
  			console.log('unselect collection')
  			collectionMetadata.checked = false
  			resolve(this.collections[collectionMetadata.dir])
  		}
  		else if (collectionMetadata.loaded) {
  			// Already loaded
  			console.log('select already loaded collection')
  			collectionMetadata.checked = true
  			resolve(this.collections[collectionMetadata.dir])
  		}
  		else {
  			// load & select
		  	loadCollectionJson(collectionMetadata.dir, (res) => {
		  		console.log('loading collection')
		  		collectionMetadata.loaded = true
		  		collectionMetadata.checked = true
			  	this.collections[collectionMetadata.dir] = res
			  	resolve(this.collections[collectionMetadata.dir])})
		 }
	})
  }

}

export default MosaicData