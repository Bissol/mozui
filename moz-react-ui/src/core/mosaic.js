import Cluster from './cluster'
let CollectionsIndexingWorker = require("./workers/indexCollectionsFromSeeds.w.js")
let TargetTilesIndexingWorker = require("./workers/indexTilesFromSeeds.w.js")
let SubSolverWorker = require("./workers/solveTilesSubset.w.js")

class Mosaic {
  
  constructor(collections, target, collection_cache, my_images) {
    this.collections = collections
    this.myCollectionImages = my_images
    this.target = target
    this.workers = []
    this.nbSeeds = 8
    this.mosaic_tile_size = 80
    this.globalParameters = undefined
    // this.allowTileFlip = false
    // this.distanceParam = 0
    // this.edgesMergeMode = ''
    // this.repetitionParam = 0
    this.seeds = []
    this.indexedCollections = []
    this.clusterer = new Cluster(this.target.colorData, this.nbSeeds)
    // this.localStorageCurrentKeyIndex = 0
    // this.sessionStorageCurrentKeyIndex = 0
    this.collectionCache = collection_cache
    // this.downloadedImages = 0
    // this.gottenFromCacheImages = 0
    this.ready = false

    this.result = {}
  }

  indexCollectionsWithWorkers() {
    return new Promise( (resolve, reject) => {
      let worker = new CollectionsIndexingWorker()
      worker.postMessage({cmd: 'start', seeds: this.seeds, collections: this.collections, allowTileFlip : this.globalParameters.allowTileFlip, distanceParam: this.globalParameters.distance})
      worker.addEventListener("message", (event) => {
        if (!event.data) reject('indexCollectionsWithWorkers: no data')
        this.indexedCollections = event.data.data
        resolve()
      })
    })
  }

  // Returns array (seed idx) of array of {tile:, index:}
  indexTilesWithWorkers() {
    return new Promise( (resolve, reject) => {
      let worker = new TargetTilesIndexingWorker()
      worker.postMessage({cmd: 'start', seeds: this.seeds, tiles: this.target.colorData, distanceParam: this.globalParameters.distance})
      worker.addEventListener("message", (event) => {
        if (!event.data) reject('indexTilesWithWorkers: no data')
        resolve(event.data.indexedTiles)
      })
    })
  }

  // Returns array of {tile:, index:, match:}
  solveTilesSubsetWithWorkers(worker_id, subset, indexedCollection, progressCallback) {
    return new Promise( (resolve, reject) => {
      console.log('Launching solver worker')
      let worker = new SubSolverWorker()
      worker.postMessage(
        {
          cmd: 'start', 
          worker_id: worker_id,
          tilesWithIndex: subset,
          indexedCollection: indexedCollection,
          distanceParam: this.globalParameters.distance,
          repetitionParam: this.globalParameters.repetition,
          numCol: this.target.numCol
        })
      worker.addEventListener("message", (event) => {
        if (event.data.type === 'result') {
          console.log('Worker done')
          resolve(event.data.solvedSubset)
        }
        else if (event.data.type === 'progress') {
          progressCallback(event.data.worker_id, event.data.nbSolved)
        }
      })
    })
  }

  // Lauches as many workers as seeds
  makeWithWorkers(mainProgressCallback) {

    console.log('Starting mosaic (workers) with ncr=' + this.target.numColRow)

    let workersCompletion = new Array(this.nbSeeds)
    let progressCallback = (worker_id, nbSolved) => {
      workersCompletion[worker_id] = nbSolved
      //console.log("Worker #" + worker_id + " is " + percent + " done")
      let avg = Math.round((workersCompletion.reduce( (a,b) => {return a+b}) / (this.target.numCol*this.target.numRow)) * 100)

      mainProgressCallback(avg)
    }

    return new Promise( (resolve, reject) => {

      if (!this.ready) reject('Not ready')

      // Worker for distributing target tiles to n groups
      this.indexTilesWithWorkers().then( (indexedTiles) => {
        // Launch n workers with their own tiles group and own collection (mixed) 
        Promise.all( indexedTiles.map( (sub, sub_i) => this.solveTilesSubsetWithWorkers(sub_i, sub, this.indexedCollections[sub_i], progressCallback)) ).then( (solvedSubsets) => {
          // Rebuild result from sub results
          this.result.data = new Array(this.target.colorData.length)
          this.result.w = this.target.numCol
          this.result.h = this.target.numRow
          solvedSubsets.forEach( (subset) => {
            subset.forEach( (item) => {
              this.result.data[item.index] = item.match
            })
          })
          
          //this.serverRender()
          resolve()
        })
      })
    })
    
  }
  
  make()
  {
    console.log('Starting mosaic with ncr=' + this.target.numColRow)
    return new Promise( (resolve, reject) => {
      if (this.ready) {
        let compTime = this.makeSingleThread()
        resolve(compTime)
      }
      else {
        reject('Not ready')
      }
      
    })
  }

  makeSingleThread()
  {
    let t0 = performance.now()
    this.result.data = []
    this.result.w = this.target.numCol
    this.result.h = this.target.numRow
    this.target.colorData.forEach( (cd, cdi) => {
      let cluster_i = this.assignTileToSeed(cd)
      let best = this.findBestMatch(cd, this.indexedCollections[cluster_i])
      if (!best) console.error('No match for region ' + cdi)
      this.result.data.push(best)
    })
    
    let t1 = performance.now()
    console.log("Making mosaic (single thread) took " + (t1 - t0) + " milliseconds.")
    return t1
  }
  
  // ***************************** MAKING THE REAL THING ***************************************
  clientRenderBlockMethod(progressCallback) {
    progressCallback(0)
    let moz_i = this.result.w
    let moz_j = this.result.h
    let data = this.result.data
    const mozaic_width = this.mosaic_tile_size * moz_i
    const mozaic_height = this.mosaic_tile_size * moz_j
    let canvas = document.createElement("canvas")
    canvas.width = mozaic_width
    canvas.height = mozaic_height
    
    let tiles_to_process = []
    for (let i = 0; i < moz_i; i++)
    {
      for (let j = 0; j < moz_j; j++)
      {
        let idx = j*moz_i + i
        let tilejob = JSON.parse(JSON.stringify(data[idx]))
        tilejob.xpos = i * this.mosaic_tile_size
        tilejob.ypos = j * this.mosaic_tile_size
        tiles_to_process.push(tilejob)
      }
    }

    const collection_used_in_mosaic = this.getCollectionsToUse(tiles_to_process)

    return new Promise( (resolve, reject) => {
      let done = () => {
        const quality = 0.8
        canvas.getContext('2d').save()
        canvas.getContext('2d').globalCompositeOperation = this.globalParameters.edgesMergeMode
        canvas.getContext('2d').drawImage(this.target.edgeImage, 0, 0, mozaic_width, mozaic_height)
        canvas.getContext('2d').restore()
        let data = canvas.toDataURL("image/jpeg", quality)
        canvas = null
        resolve(data)
      }
      this.loadCollectionsToUse(collection_used_in_mosaic).then( () => {
        this.processTileJobListBlockMethod(tiles_to_process, this.myCollectionImages, canvas, done, progressCallback)
      })
    })
  }

  getCollectionsToUse(tiles_to_process) {
    let res = []
    tiles_to_process.forEach( e => {
      if (!res.includes(e.c)) {
        res.push(e.c)
      }
    })

    return res
  }

  // Put it in local cache
  loadCollectionsToUse(collectionsToUse) {
    return new Promise( (resolve, reject) => {
      Promise.all(collectionsToUse.map(c => this.loadCollectionData(c))).then( values => {
        resolve()
      })
    })
  }

  loadCollectionData(collection) {

    return new Promise( (resolve, reject) => {
      if (collection === "MyCollection" || collection in this.collectionCache) {
        console.log(`Collection ${collection} already in cache`)
        resolve()
      }
      else {
        console.error('Should not be doing that from here...')
        reject()
        // // Load json mapping
        // const mapping_url = `http://debarena.com/moz/data/tiles/${collection}/mapping_${this.mosaic_tile_size}.json`
        // const block_url = `http://debarena.com/moz/data/tiles/${collection}/all_${this.mosaic_tile_size}.jpg`
        // const generate_url = `http://debarena.com/moz/php/createTiledCollection.php?collection_name=${collection}&tilesize=${this.mosaic_tile_size}`

        // return fetch(mapping_url)
        // .then( (response) => {
        //   return response.json()
        // }).then( (json) => {
        //   // Mapping loaded
        //   this.collectionCache[collection] = {}
        //   this.collectionCache[collection].mapping = json
        //   console.log(`Mapping for ${collection} loaded`)

        //   // Load block
        //   let img = new Image()
        //   img.onload = () => {
        //     this.collectionCache[collection].block = img
        //     console.log(`Block for ${collection} loaded`)
        //     resolve()
        //   }
        //   img.crossOrigin="anonymous"
        //   img.src = block_url

        // }).catch(function(ex) {
        //   console.log(`Collection ${collection} not ready on server`)
        //   fetch(generate_url).then( (response) => {
        //     console.log(response)
        //     alert(`Erreur serveur, veuillez recharger la page et recommencer (désolé).`)
        //   })
        // })
        
      }
      
    })
  }

  processTileJobListBlockMethod(tiles_to_process, myImages, canvas, done, progressCallback) {
    console.log(`${tiles_to_process.length} tiles to process`)
    let i = 0
    let processTile =  () => {
      if (i === tiles_to_process.length) {
        done()
      }
      else {
        window.requestAnimationFrame(processTile)
        let tile = tiles_to_process[i]
        const is_my = tile.c === "MyCollection"
        let ccache = is_my ? undefined : this.collectionCache[tile.c]
        let img = is_my ? undefined : ccache.block
        let map = is_my ? undefined : ccache.mapping
        let tilesize = map ? img.width / Math.ceil(Math.sqrt(Object.keys(map).length)): undefined
        let sx = is_my ? undefined : map[tile.d.name].i * tilesize
        let sy = is_my ? undefined : map[tile.d.name].j * tilesize
        let dx = tile.xpos
        let dy = tile.ypos
        let is_flipped = tile.f

        if (is_flipped) {
          canvas.getContext('2d').save()
          canvas.getContext('2d').scale(-1, 1);
        }

        if (is_my) {
          canvas.getContext('2d').drawImage(myImages[tile.d.name], is_flipped ? -dx : dx, dy, is_flipped ? -this.mosaic_tile_size : this.mosaic_tile_size, this.mosaic_tile_size)
        }
        else {
          // const nb_tiles = Object.keys(map).length
          // const border_in_tiles = Math.ceil(Math.sqrt(nb_tiles))
          // const actual_tile_width = img.width / border_in_tiles
          // alert(`Drawing at ${sx},${sy} from img ${img.width}X${img.height}`)

          canvas.getContext('2d').drawImage(img, sx, sy, tilesize, tilesize, is_flipped ? -dx : dx, dy, is_flipped ? -this.mosaic_tile_size : this.mosaic_tile_size, this.mosaic_tile_size)
        }
        
        if (is_flipped) {
          canvas.getContext('2d').restore()
        }

        // Apply intensity correction
        canvas.getContext('2d').save()
        canvas.getContext('2d').globalCompositeOperation = 'source-over'
        canvas.getContext('2d').beginPath()
        canvas.getContext('2d').rect(dx, dy, this.mosaic_tile_size, this.mosaic_tile_size)
        let icc = tile.intensityCorrection > 0 ? 255 : 0
        let alpha = Math.abs(tile.intensityCorrection * (this.globalParameters.luminosityCorrection * 0.8)) / 255
        canvas.getContext('2d').fillStyle = `rgba(${icc}, ${icc}, ${icc}, ${alpha})`
        canvas.getContext('2d').fill()
        canvas.getContext('2d').restore()

        progressCallback(Math.round(100 * (i / tiles_to_process.length)))
        i++
      }
    }

    window.requestAnimationFrame(processTile)

    // for (let i=0; i<tiles_to_process.length; i++) {
    //   let tile = tiles_to_process[i]
    //   let ccache = this.collectionCache[tile.c]
    //   let img = ccache.block
    //   let map = ccache.mapping
    //   let sx = map[tile.d.name].i * 150
    //   let sy = map[tile.d.name].j * 150
    //   let dx = tile.xpos
    //   let dy = tile.ypos
    //   canvas.getContext('2d').drawImage(img, sx, sy, 150, 150, dx, dy, 150, 150)
    //   progressCallback(Math.round(100 * (i / tiles_to_process.length)))
    // }

    // done()
  }

  // clientRender(progressCallback) {
  //   progressCallback(0)
  //   this.downloadedImages = 0
  //   this.gottenFromCacheImages = 0
  //   let moz_i = this.result.w
  //   let moz_j = this.result.h
  //   let data = this.result.data
  //   const tilesize = 150
  //   const mozaic_width = tilesize * moz_i
  //   const mozaic_height = tilesize * moz_j
  //   let canvas = document.createElement("canvas")
  //   canvas.width = mozaic_width
  //   canvas.height = mozaic_height
  //   let mini_canvas = document.createElement("canvas")
  //   mini_canvas.width = 150
  //   mini_canvas.height = 150

  //   let tiles_to_process = []
  //   for (let i = 0; i < moz_i; i++)
  //   {
  //     for (let j = 0; j < moz_j; j++)
  //     {
  //       let idx = j*moz_i + i
  //       let tilejob = JSON.parse(JSON.stringify(data[idx]))
  //       tilejob.xpos = i * tilesize
  //       tilejob.ypos = j * tilesize
  //       tilejob.url = `http://debarena.com/moz/data/tiles/${data[idx].c}/${data[idx].d.name}`
  //       tiles_to_process.push(tilejob)
  //     }
  //   }

  //   // Sort by url (so that cache is efficient)
  //   function compare_by_url(a,b) {
  //     if (a.url < b.url)
  //       return -1
  //     if (a.url > b.url)
  //       return 1
  //     return 0
  //   }

  //   tiles_to_process.sort(compare_by_url)

  //   return new Promise( (resolve, reject) => {
  //     let done = () => {
  //       let cache_rate = Math.round(100 * (this.gottenFromCacheImages / (this.gottenFromCacheImages + this.downloadedImages)))
  //       console.log(`Done rendering. ${this.gottenFromCacheImages} from cache, ${this.downloadedImages} from server (${cache_rate}%).`)
  //       resolve(canvas.toDataURL("image/png"))
  //     }
  //     this.processTileJobList(tiles_to_process, tiles_to_process.length, canvas, mini_canvas, done, progressCallback)
  //   })
  // }

  // processTileJobList(tileJobs, jobCount, canvas, mini_canvas, callback, progressCallback) {
  //   if (tileJobs.length === 0) {
  //     callback()
  //   }
  //   else {
  //     let img = new Image()
  //     img.crossOrigin="anonymous"
  //     img.onload = () => {
  //       this.add_cache(img, mini_canvas)
  //       canvas.getContext('2d').drawImage(img, tileJobs[0].xpos, tileJobs[0].ypos)
  //       tileJobs.shift()
  //       progressCallback(Math.round(100 * ((jobCount - tileJobs.length) / jobCount)))
  //       this.processTileJobList(tileJobs, jobCount, canvas, mini_canvas, callback, progressCallback)
  //     }

  //     img.mustCache = false
  //     img.keyurl = tileJobs[0].url
  //     img.src = this.try_cache(tileJobs[0].url, img)
  //   }
  // }

  // add_cache(image, mini_canvas) {
  //   if (image.mustCache) {
  //     mini_canvas.getContext('2d').drawImage(image, 0, 0)
  //     try {
  //       localStorage.setItem(image.keyurl, mini_canvas.toDataURL("image/png"))
  //     }
  //     catch(err)
  //     {
  //       // Local storage must be full... try session storage
  //       try {
  //         console.log('adding to session storage')
  //         sessionStorage.setItem(image.keyurl, mini_canvas.toDataURL("image/png"))
  //       }
  //       catch(err) {
  //         // Also full... gotta delete something!
  //         this.localStorageCurrentKeyIndex++
  //         if (this.localStorageCurrentKeyIndex >= localStorage.length) {
  //           // Switch to session storage
  //           this.sessionStorageCurrentKeyIndex++
  //           if (this.sessionStorageCurrentKeyIndex >= sessionStorage.length) {
  //             // Time to switch back to localStorage
  //             this.localStorageCurrentKeyIndex = 0
  //             this.sessionStorageCurrentKeyIndex = 0
  //           }
  //           else {
  //             let aKeyName = sessionStorage.key(this.sessionStorageCurrentKeyIndex)
  //             sessionStorage.removeItem(aKeyName)
  //             console.log(`Freed element ${this.sessionStorageCurrentKeyIndex} from sessionStorage (${sessionStorage.length} elements)`)
  //           }
  //         }
  //         else {
  //           let aKeyName = localStorage.key(this.localStorageCurrentKeyIndex)
  //           localStorage.removeItem(aKeyName)
  //           console.log(`Freed element ${this.localStorageCurrentKeyIndex} from localStorage (${localStorage.length} elements)`)
  //         }
  //         //this.localStorageCurrentKeyIndex = 0
          
  //       }
  //     }
  //   }
  // }

  // try_cache(url, img) {
  //   if (localStorage.getItem(url) === null && sessionStorage.getItem(url) === null) {
  //     img.mustCache = true
  //     this.downloadedImages++
  //     return url
  //   }
  //   else {
  //     this.gottenFromCacheImages++
  //     return (localStorage.getItem(url) === null ? sessionStorage.getItem(url) : localStorage.getItem(url))
  //   }
  // }

  // serverRender()
  // {
  //   return new Promise( (resolve, reject) => {
  //     let t0 = performance.now()
  //     let baseUrl = "http://debarena.com/moz/php"
  //     var XHR = new XMLHttpRequest()
  //     XHR.addEventListener('load', function(event) {
  //       //console.log(XHR.responseText)
  //       let src = "data:image/jpeg;base64," + XHR.responseText
  //       let t1 = performance.now()
  //       console.log("Rendering mosaic took " + (t1 - t0) + " milliseconds.")
  //       resolve(src)
  //     })
      
  //     XHR.addEventListener('error', function(event) {
  //       alert('Oups! Something goes wrong.')
  //     })
      
  //     XHR.open('post', baseUrl + '/serverRender.php', true)
  //     XHR.setRequestHeader("Content-type", "application/json")
  //     XHR.send(encodeURIComponent(JSON.stringify(this.result)))
  //   })
  // }
  
  computeFastIndex()
  {
    return new Promise( (resolve, reject) => {
      this.findSeeds()
      this.indexCollectionsWithWorkers().then( () => resolve() )
      //this.distributeCollectionsItems()
    })
  }
  
  
  findSeeds()
  {
    if (this.target.colorData.length === 0)
      {
        this.target.extractColorInfo()
        console.log('Color data not present in target. Getting it now.')
      }
    
    this.seeds = this.clusterer.getClusterCenters(this.globalParameters.distance)
  }
}

export default Mosaic