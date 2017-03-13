import Cluster from './cluster'
import {distance} from './distance'
import {serverRender, computeFastIndex, distributeCollectionsItems, findSeeds, assignTileToSeed, findBestMatch} from './mosaicFunctions.js'
let CollectionsIndexingWorker = require("./workers/indexCollectionsFromSeeds.w.js")
let TargetTilesIndexingWorker = require("./workers/indexTilesFromSeeds.w.js")
let SubSolverWorker = require("./workers/solveTilesSubset.w.js")

class Mosaic {
  
  constructor(collections, target) {
    this.collections = collections
    this.target = target
    this.workers = []
    this.nbSeeds = 10
    this.seeds = []
    this.indexedCollections = []
    this.clusterer = new Cluster(this.target.colorData, this.nbSeeds)

    this.ready = false

    this.result = {}
  }

  indexCollectionsWithWorkers() {
    return new Promise( (resolve, reject) => {
      let worker = new CollectionsIndexingWorker()
      worker.postMessage({cmd: 'start', seeds: this.seeds, collections: this.collections})
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
      worker.postMessage({cmd: 'start', seeds: this.seeds, tiles: this.target.colorData})
      worker.addEventListener("message", (event) => {
        if (!event.data) reject('indexTilesWithWorkers: no data')
        resolve(event.data.indexedTiles)
      })
    })
  }

  // Returns array of {tile:, index:, match:}
  solveTilesSubsetWithWorkers(subset, indexedCollection) {
    return new Promise( (resolve, reject) => {
      console.log('Launching solver worker')
      let worker = new SubSolverWorker()
      worker.postMessage({cmd: 'start', tilesWithIndex: subset, indexedCollection: indexedCollection})
      worker.addEventListener("message", (event) => {
        if (!event.data) reject('indexTilesWithWorkers: no data')
        console.log('Worker done')
        resolve(event.data.solvedSubset)
      })
    })
  }

  // Lauches as many workers as seeds
  makeWithWorkers() {

    console.log('Starting mosaic (workers) with ncr=' + this.target.numColRow)
    return new Promise( (resolve, reject) => {

      if (!this.ready) reject('Not ready')

      // Worker for distributing target tiles to n groups
      this.indexTilesWithWorkers().then( (indexedTiles) => {
        // Launch n workers with their own tiles group and own collection (mixed) 
        Promise.all( indexedTiles.map( (sub, sub_i) => this.solveTilesSubsetWithWorkers(sub, this.indexedCollections[sub_i])) ).then( (solvedSubsets) => {
          // Rebuild result from sub results
          this.result.data = new Array(this.target.colorData.length)
          this.result.w = this.target.numCol
          this.result.h = this.target.numRow
          solvedSubsets.forEach( (subset) => {
            subset.forEach( (item) => {
              this.result.data[item.index] = item.match
            })
          })
          
          this.serverRender()
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
  
  serverRender()
  {
    let t0 = performance.now()
    let baseUrl = "http://debarena.com/moz/php"
    var XHR = new XMLHttpRequest()
    XHR.addEventListener('load', function(event) {
      console.log(XHR.responseText)
      let t1 = performance.now()
      console.log("Rendering mosaic took " + (t1 - t0) + " milliseconds.")
    })
    
    XHR.addEventListener('error', function(event) {
      alert('Oups! Something goes wrong.')
    })
    
    XHR.open('post', baseUrl + '/serverRender.php', true)
    XHR.setRequestHeader("Content-type", "application/json")
    XHR.send(encodeURIComponent(JSON.stringify(this.result)))
  }
  
  computeFastIndex()
  {
    return new Promise( (resolve, reject) => {
      this.findSeeds()
      this.indexCollectionsWithWorkers().then( () => resolve() )
      //this.distributeCollectionsItems()
    })
  }
  

  // distributeCollectionsItems()
  // {
  //   if (this.seeds.length <= 0) {
  //     console.error('No seeds, aborting')
  //     return false
  //   }
    
  //   let t0 = performance.now()
  //   let tot = 0
  //   this.indexedCollections = new Array(this.seeds.length)
  //   this.seeds.forEach( (s,i) => {
  //     this.indexedCollections[i] = []
  //   })
    
  //   let func = (item, collec) => {
  //     let idx = this.assignTileToSeed(item)
  //     this.indexedCollections[idx].push({c:collec.name, d:item})
  //     tot++
  //   }

  //   for (let key in this.collections) {
  //     if(this.collections.hasOwnProperty(key)) {
  //       let collec = this.collections[key]
  //       collec.data.forEach( item => func(item, collec))
  //     }
  //   }
    
  //   let t1 = performance.now();
  //   console.log("Indexing " + tot + " items took " + (t1 - t0) + " milliseconds.")
  // }
  
  findSeeds()
  {
    if (this.target.colorData.length === 0)
      {
        this.target.extractColorInfo()
        console.log('Color data not present in target. Getting it now.')
      }
    
    
    this.seeds = this.clusterer.getClusterCenters()
    /*const firstSeedIndex = Math.floor(Math.random() * this.target.colorData.length)
    this.seeds[0] = this.target.colorData[firstSeedIndex]
    
    for (var i=0; i<this.nbSeeds; i++) {
      this.seeds.push(this.target.colorData[this.getOppositeSeedIdx()])
    }*/
    
    /*for (var i=0; i<this.nbSeeds; i++) {
      const ri = Math.floor(Math.random() * this.target.colorData.length)
      this.seeds[i] = this.target.colorData[ri]
    }*/
  }
  
 /* getOppositeSeedIdx()
  {
    let opidx = -1
    let maxDist = 0
    this.target.colorData.forEach( (el, eli) => {
      // Comp dist between el and other seeds
      let d = 0
      let sumi = 0
      this.seeds.forEach(function(see, isee) {
        d += (isee+1) * distance(el,see)
        sumi += isee+1
      })
      d = d / sumi
      
      if (d > maxDist) {
        maxDist = d
        opidx = eli
      }
    })
    
    return opidx
  }*/
  
  assignTileToSeed(t)
  {
    let minDist = -1
    let seedi = -1
    if (!this.seeds) console.error('No seeds')
    this.seeds.forEach( (s,i) => {
      let d = distance(t,s)
      if (minDist === -1 || d  < minDist) {
        minDist = d
        seedi = i
      }
    })
    
    return seedi
  }
  
  findBestMatch(t, tiles)
  {
    let minDist = Infinity
    let best = undefined
    if (!tiles) console.error('No tiles')
    tiles.forEach( (tt,tti) => {
      let d = distance(t,tt.d)
      if (d  < minDist) {
        minDist = d
        best = tiles[tti]
      }
    })
    return best
  }
  
  setupWorkers()
  {
    
  }
}

export default Mosaic