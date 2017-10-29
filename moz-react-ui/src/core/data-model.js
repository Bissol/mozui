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
    this.collectionMetadataUrl = "http://funzaic.com/api/collections"// serverUrl + 'php/collectionsDescription.json'
    this.collectionsMetadata = []
    this.collections = []
    this.collections.push({name: 'Mes images', data: []})
    this.collectionCache = {}
    this.myCollectionImages = {}

    // Mosaic
    this.mosaic = undefined
    this.mustReindex = false
    this.mustReprocessTargetImage = false
    this.mosaic_tile_size = 100

    // Parameters
    const parametersDefault = {
      numColRow_DEFAULT : 50,
      allowTileFlip_DEFAULT : true,
      distance_DEFAULT : 50,
      repetition_DEFAULT : 30,
      edgesFactor_DEFAULT : 1,
      edgesMergeMode_DEFAULT : 'screen',
      luminosityCorrection_DEFAULT : 5,
      tileSize_DEFAULT : 2
    }
    
    let check= (paramkey) => {
      let v = localStorage.getItem(paramkey)
      if (!v || v === "NaN" || v==="undefined" || v==="null" || v==="") {
        return parametersDefault[`${paramkey}_DEFAULT`]
      }
      else {
        return v
      }
    }

    this.parameters = { 
      numColRow : check('numColRow'),
      allowTileFlip : check('allowTileFlip'),
      distance : check('distance'),
      repetition : check('repetition'),
      edgesFactor : check('edgesFactor'),
      edgesMergeMode : check('edgesMergeMode'),
      luminosityCorrection : check('luminosityCorrection'),
      tileSize: check('tileSize')
    }

    this.changeTileSize()
  }

  changeTileSize() {
    const ar = [50,75,100,125,150]
    if (this.parameters.tileSize < 0 || this.parameters.tileSize > 4) {
      console.error(`Bad tile size: ${this.parameters.tileSize}`)
      return false
    }
    else {
      this.mosaic_tile_size = ar[this.parameters.tileSize]
      this.collectionCache = {}
      this.collectionsMetadata.forEach(col => col.loaded = false)
      console.log(`Tile size changed to ${this.mosaic_tile_size}`)
    }
  }
 
  setTarget(imgData, callback, callbackProgress) {
    this.target = new Target(imgData, callback, this.parameters.numColRow, callbackProgress, this.parameters)
    this.mustReindex = true
  }

  initializeCollections() {
  	return fetch(this.collectionMetadataUrl)
	  .then( (response) => {
      //console.log(response)
	    return response.json()
	  }).then( (json) => {
	    console.log('parsed json', json)
	    let collections = json
	    collections = collections.map( c => {
        let nc = {}
        nc.checked = false;
        nc.loaded = c.isMyCollection ? true : false;
        nc.name_fr = c.field_name_fr[0].value;
        nc.name_eng = c.field_name_eng[0].value;
        nc.nb_images = c.field_nbimages[0].value;
        nc.dir = c.field_dir[0].value;
        nc.is_adult = c.field_isadult.length === 0 ? false : c.field_isadult[0].value;
        return nc
      })
	    return this.collectionsMetadata = collections
	  }).catch(function(ex) {
	    console.error('JSON pourri : ', ex)
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
  		else if (collectionMetadata.loaded || collectionMetadata.dir === "MyCollection") {
  			// Already loaded
  			console.log('Selecting already loaded collection')
  			collectionMetadata.checked = true
  			resolve(this.collections[collectionMetadata.dir])
  		}
  		else {
  			// load & select
        this.loadCollectionData(collectionMetadata.dir)
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

  // Load collection mapping and block and put it to cache
  loadCollectionData(collection) {
    return new Promise( (resolve, reject) => {
      if (collection === "MyCollection" || collection in this.collectionCache) {
        console.log(`Collection ${collection} already in cache`)
        resolve()
      }
      else {
        // Load json mapping
        const mapping_url = `http://debarena.com/moz/data/tiles/${collection}/mapping_${this.mosaic_tile_size}.json`
        const block_url = `http://debarena.com/moz/data/tiles/${collection}/all_${this.mosaic_tile_size}.jpg`
        const generate_url = `http://debarena.com/moz/php/createTiledCollection.php?collection_name=${collection}&tilesize=${this.mosaic_tile_size}`

        return fetch(mapping_url)
        .then( (response) => {
          return response.json()
        }).then( (json) => {
          // Mapping loaded
          this.collectionCache[collection] = {}
          this.collectionCache[collection].mapping = json
          console.log(`Mapping for ${collection} loaded`)

          // Load block
          let img = new Image()
          img.onload = () => {
            this.collectionCache[collection].block = img
            console.log(`Block for ${collection} loaded`)
            resolve()
          }
          img.crossOrigin="anonymous"
          img.src = block_url

        }).catch(function(ex) {
          console.log(`Collection ${collection} not ready on server`)
          fetch(generate_url).then( (response) => {
            alert(`Erreur serveur, veuillez recharger la page et recommencer (désolé).`)
          })
        })
        
      }
      
    })
  }

  // Adds an image to the special myCollection
  addImageToMyCollection(pixelData, img) {

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
        // Save color infos
        let tile = event.data.data
        tile.name = this.collections["MyCollection"].data.length.toString() + '0'
        this.collections["MyCollection"].data.push(tile)

        // Save image
        this.myCollectionImages[tile.name] = img
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
  	  	this.mosaic = new Mosaic(selectionOfCollections, this.target, this.collectionCache, this.myCollectionImages)
        this.mosaic.globalParameters = this.parameters
        // this.mosaic.allowTileFlip = this.parameters.allowTileFlip
        // this.mosaic.distanceParam = this.parameters.distance
        // this.mosaic.repetitionParam = this.parameters.repetition
        // this.mosaic.edgesMergeMode = this.parameters.edgesMergeMode
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