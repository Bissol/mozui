// Data model for the app component
// Responsible for server communication
require('whatwg-fetch')
import Target from '../core/target'
import Mosaic from '../core/mosaic'
let BinaryLoaderWorker = require("../core/workers/loadBinaries.w.js")
let ImageToColorDataWorker = require("../core/workers/imageToColorData.w.js")

class MosaicData {

  constructor(serverUrl) {

  	// Target image
    this.target = undefined

    // Collections
    this.collectionMetadataUrl = serverUrl + 'php/collectionsDescription.json'
    this.collectionsMetadata = undefined
    this.collections = []
    this.collections.push({name: 'Mes images', data: []})
    this.collectionCache = {}

    // Mosaic
    this.mosaic = undefined
    this.mustReindex = false

    // Parameters
    const numColRow_DEFAULT = 50
    const allowTileFlip_DEFAULT = true
    const distance_DEFAULT = 50
    const repetition_DEFAULT = 30
    this.parameters = { 
          numColRow : (localStorage.getItem('numColRow') ? localStorage.getItem('numColRow') : numColRow_DEFAULT),
          allowTileFlip : (localStorage.getItem('allowTileFlip') ? localStorage.getItem('allowTileFlip') : allowTileFlip_DEFAULT),
          distance : (localStorage.getItem('distance') ? localStorage.getItem('distance') : distance_DEFAULT),
          repetition : (localStorage.getItem('repetition') ? localStorage.getItem('repetition') : repetition_DEFAULT)
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
	    collections = collections.map( c => {c.checked = false; c.loaded = c.isMyCollection ? true : false; return c})
	    return this.collectionsMetadata = collections
	  }).catch(function(ex) {
	    console.error('parsing failed', ex)
	  })
  }

  // Toggle selection + loads collection from server if necessary
  selectCollection(collectionMetadata, progressCallback) {
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
        let worker = new BinaryLoaderWorker()
        worker.postMessage({cmd: 'start', collectionName: collectionMetadata.dir})
        worker.addEventListener("message", (event) => {
          if (event.data.type === 'result') {
            collectionMetadata.loaded = true
            collectionMetadata.checked = true
            this.collections[collectionMetadata.dir] = event.data.collec
            resolve(this.collections[collectionMetadata.dir])
          }
          else if (event.data.type === 'progress') {
            progressCallback(event.data.percent)
          }
        })
		 }
	})
  }

  // Adds an image to the special myCollection
  addImageToMyCollection(pixelData) {

    // Create if necessary
    if (!("MyCollection" in this.collections)) {
      console.log(`Initializing myCollection`)
      this.collections["MyCollection"] = {}
      this.collections["MyCollection"].name = "MyCollection"
      this.collections["MyCollection"].data = []
    }

    // Compute averages
    let worker = new ImageToColorDataWorker()
    worker.postMessage({cmd: 'start', pixelData: pixelData})
    worker.addEventListener("message", (event) => {
      if (event.data.type === 'result') {
        let tile = event.data.data
        tile.name = this.collections["MyCollection"].data.length.toString() + '0'
        this.collections["MyCollection"].data.push(tile)
        console.log("User image processed")
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

  isReadyForMakingPreview() {
    let selectionOfCollections = this.getSelectedCollections()
    return selectionOfCollections && Object.keys(selectionOfCollections).length > 0 && this.target
  }

  // Initializes a new mosaic using current parameters
  initMosaic() {
  	return new Promise( (resolve, reject) => {
    	let selectionOfCollections = this.getSelectedCollections()

    	if (selectionOfCollections && Object.keys(selectionOfCollections).length > 0 && this.target) {
  	  	this.mosaic = new Mosaic(selectionOfCollections, this.target, this.collectionCache)
        this.mosaic.allowTileFlip = this.parameters.allowTileFlip
        this.mosaic.distanceParam = this.parameters.distance
        this.mosaic.repetitionParam = this.parameters.repetition
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
  renderLowResMosaic(localRendering, progressCallback) {

    return new Promise( (resolve, reject) => {

      if (this.mosaic.result) {
        if (localRendering) {
          this.mosaic.clientRenderBlockMethod(progressCallback).then( (src) => {
            resolve(src)
          }, () => {
            reject("Erreur lors de la génération locale de la mosaïque")
          })
        }
        else {
          this.mosaic.serverRender().then( (src) => {
            resolve(src)
          }, () => {
            reject("Erreur lors de la génération de la mosaïque sur le serveur")
          })
        }
        
      }
      else {
        reject("Pas de mosaïque à générer")
      }

    })
  }

}

export default MosaicData