// Data model for the app component
// Responsible for server communication
require('whatwg-fetch')
import { loadCollectionJson } from '../core/collectionLoader'
import Target from '../core/target'
import Mosaic from '../core/mosaic'


class MosaicData {

  constructor(serverUrl) {

  	// Target image
    this.target = undefined

    // Collections
    this.collectionMetadataUrl = serverUrl + 'php/collectionsDescription.json'
    this.collectionsMetadata = undefined
    this.collections = []

    // Mosaic
    this.mosaic = undefined
    this.mustReindex = false

    // Parameters
    const numColRow_DEFAULT = 50
    const allowTileFlip_DEFAULT = true
    this.parameters = { 
          numColRow : (localStorage.getItem('numColRow') ? localStorage.getItem('numColRow') : numColRow_DEFAULT),
          allowTileFlip : (localStorage.getItem('allowTileFlip') ? localStorage.getItem('allowTileFlip') : allowTileFlip_DEFAULT)
        }
  }
 
  setTarget(imgData, callback, callbackProgress) {
    this.target = new Target(imgData, callback, this.parameters.numColRow, callbackProgress)
    this.mustReindex = true
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
	    console.error('parsing failed', ex)
	  })
  }

  // Toggle selection + loads collection from server if necessary
  selectCollection(collectionMetadata) {
    this.mustReindex = true

  	return new Promise( (resolve, reject) => {
  		if (collectionMetadata.checked)
  		{
  			// Unselect (already loaded)
  			console.log('Unselecting collection')
  			collectionMetadata.checked = false
  			resolve(this.collections[collectionMetadata.dir])
  		}
  		else if (collectionMetadata.loaded) {
  			// Already loaded
  			console.log('Selecting already loaded collection')
  			collectionMetadata.checked = true
  			resolve(this.collections[collectionMetadata.dir])
  		}
  		else {
  			// load & select
  			console.log(collectionMetadata)
		  	loadCollectionJson(collectionMetadata.dir, (res) => {
		  		console.log('Loading collection')
		  		collectionMetadata.loaded = true
		  		collectionMetadata.checked = true
			  	this.collections[collectionMetadata.dir] = res
			  	resolve(this.collections[collectionMetadata.dir])})
		 }
	})
  }

  // Get an object whose properties are selected collections
  getSelectedCollections() {
  	let selectedCollections = {}
  	for (let key in this.collections) {
  		if(this.collections.hasOwnProperty(key)) {
	  		let col = this.collections[key]
	  		this.collectionsMetadata.forEach( (collectionMetadata) => {
	  			if (collectionMetadata.dir === col.name) {
	  			 if (collectionMetadata.loaded && collectionMetadata.checked) {
	  			 	selectedCollections[key] = col
	  			 }
	  			}
	  		})
	  	}
  	}

  	return selectedCollections
  }

  // Initializes a new mosaic using current parameters
  initMosaic() {
  	return new Promise( (resolve, reject) => {
    	let selectionOfCollections = this.getSelectedCollections()

    	if (selectionOfCollections && Object.keys(selectionOfCollections).length > 0 && this.target) {
  	  	this.mosaic = new Mosaic(selectionOfCollections, this.target)
        this.mosaic.allowTileFlip = this.parameters.allowTileFlip
  	  	this.mosaic.computeFastIndex().then( () => {
          this.mosaic.ready = true
          this.mustReindex = false
          resolve()
        console.log('Mosaic initialized')
        })
    	}
    	else {
    		if (this.mosaic) this.mosaic.ready = false
    		if (!selectionOfCollections) {console.error('Could not initialize mosaic')}
    		else if (Object.keys(selectionOfCollections).length <= 0) {console.log('No collection selected')}
    		else if (!this.target) {console.error('Target image not ready')}

        reject("Mosaïque non initialisée")
    	}
    })
  }

  // Compute mosaic based on collections, target and current parameters
  computeMosaic(progressCallback) {
  	return (this.mosaic && this.mosaic.ready) ? this.mosaic.makeWithWorkers(progressCallback) : Promise.reject('No mosaic or mosaic not ready')
  }

  // Render mosaic on server
  renderLowResMosaic() {

    return new Promise( (resolve, reject) => {

      if (this.mosaic.result) {
        this.mosaic.serverRender().then( (src) => {
          resolve(src)
        }, () => {
          reject("Erreur lors de la génération de la mosaïque")
        })
      }
      else {
        reject("Pas de mosaïque à générer")
      }

    })
  }

}

export default MosaicData