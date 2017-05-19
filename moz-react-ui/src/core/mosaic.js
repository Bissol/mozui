import Cluster from './cluster'
let CollectionsIndexingWorker = require("./workers/indexCollectionsFromSeeds.w.js")
let TargetTilesIndexingWorker = require("./workers/indexTilesFromSeeds.w.js")
let SubSolverWorker = require("./workers/solveTilesSubset.w.js")

class Mosaic {
  
  constructor(collections, target) {
    this.collections = collections
    this.target = target
    this.workers = []
    this.nbSeeds = 8
    this.allowTileFlip = false
    this.distanceParam = 0
    this.repetitionParam = 0
    this.seeds = []
    this.indexedCollections = []
    this.clusterer = new Cluster(this.target.colorData, this.nbSeeds)

    this.ready = false

    this.result = {}
  }

  indexCollectionsWithWorkers() {
    return new Promise( (resolve, reject) => {
      let worker = new CollectionsIndexingWorker()
      worker.postMessage({cmd: 'start', seeds: this.seeds, collections: this.collections, allowTileFlip : this.allowTileFlip, distanceParam: this.distanceParam})
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
      worker.postMessage({cmd: 'start', seeds: this.seeds, tiles: this.target.colorData, distanceParam: this.distanceParam})
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
          distanceParam: this.distanceParam,
          repetitionParam: this.repetitionParam,
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
  serverRender()
  {
    return new Promise( (resolve, reject) => {
      let t0 = performance.now()
      let baseUrl = "http://debarena.com/moz/php"
      var XHR = new XMLHttpRequest()
      XHR.addEventListener('load', function(event) {
        //console.log(XHR.responseText)
        let src = "data:image/jpeg;base64," + XHR.responseText
        let t1 = performance.now()
        console.log("Rendering mosaic took " + (t1 - t0) + " milliseconds.")
        resolve(src)
      })
      
      XHR.addEventListener('error', function(event) {
        alert('Oups! Something goes wrong.')
      })
      
      XHR.open('post', baseUrl + '/serverRender.php', true)
      XHR.setRequestHeader("Content-type", "application/json")
      XHR.send(encodeURIComponent(JSON.stringify(this.result)))
    })
  }
  
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
    
    this.seeds = this.clusterer.getClusterCenters(this.distanceParam)
  }
}

export default Mosaic