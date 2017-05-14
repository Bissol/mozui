import Cluster from './cluster'
import {distance} from './distance'


function serverRender(mozData)
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
  XHR.send(encodeURIComponent(JSON.stringify(mozData)))
}
  
// function computeFastIndex()
// {
//   let seeds = findSeeds()
//   distributeCollectionsItems(seeds)
// }

function flipTile(tile) {
  let flipped = JSON.parse(JSON.stringify(tile))
  const size = Math.sqrt(tile.nbsub)
  for (let k=0; k<tile.nbsub; k++) {
    const x = Math.floor(k / size)
    const y = k % size
    flipped.colors[k] = tile.colors[((size - 1 - x) * size) + y]
  }

  return flipped
}
  
// Returns an array of array where collection items are reorganized according to seed similarity
function distributeCollectionsItems(seeds, collections, allowTileFlip, distanceParam)
{
  if (seeds.length <= 0) {
    console.error('No seeds, aborting')
    return false
  }
  
  let t0 = performance.now()
  let tot = 0
  let indexedCollections = new Array(seeds.length)
  seeds.forEach( (s,i) => {
    indexedCollections[i] = []
  })
  
  let func = (item, collec, flipped) => {
    let idx = assignTileToSeed(item, seeds, distanceParam)
    indexedCollections[idx].push({c:collec.name, d:item, f:flipped})
    tot++
  }

  for (let key in collections) {
    if(collections.hasOwnProperty(key)) {
      let collec = collections[key]
      collec.data.forEach( item => {
        func(item, collec, false)
        if (allowTileFlip) func(flipTile(item), collec, true)
      })
    }
  }

  let t1 = performance.now();
  console.log("Indexing " + tot + " items took " + (t1 - t0) + " milliseconds.")

  return indexedCollections
}

// Adds a few tiles to empty or almost empty clusters
function fillShallowClusters(clusters, collections) {
  const minTilesThreshold = 100
  const tilesToAdd = 100
  clusters.forEach( (cluster, idx) => {
    if (cluster.length < minTilesThreshold) {
      console.log(`Cluster ${idx} too shallow (size=${cluster.length}), adding ${tilesToAdd} tiles.`)
      for (let i = 0; i< tilesToAdd; i++) {
        let keys = Object.keys(collections)
        let collec = collections[keys[ keys.length * Math.random() << 0]]
        const rand_t = Math.floor(Math.random() * collec.data.length)
        clusters[idx].push({c:collec.name, d:collec.data[rand_t], f:false})
      }
    }
  })

  return clusters
}

// Returns an array where tiles are reorganized according to seed similarity
function distributeTargetTiles(seeds, tiles, distanceParam) {
  let result = new Array(seeds.length)
  seeds.forEach( (s,i) => {
     result[i] = []
   })

  tiles.forEach( (t, ti) => {
    result[assignTileToSeed(t, seeds, distanceParam)].push({tile: t, index: ti})
  })

  return result
}

// input: {tile: colorinfo, index : idx} Result : {tile:, index:, match: indexedCollItem}
function solveTiles(tilesWithIndex, indexedCollection, distanceParam, numCol, progressCallback) {
  let penalties = []
  const tot = tilesWithIndex.length
  tilesWithIndex.forEach( (t, ti) => {
    let best = findBestMatch(t.tile, indexedCollection, distanceParam, numCol, penalties, t.index)
    if (!best) console.error('dafuk')
    t.match = best
    let tileshort = best.d.name.toString().slice(0, -1)
    if (penalties[tileshort]) {
      penalties[tileshort] += 1
    } else {
      penalties[tileshort] = 1
    }

    if (ti % 10 === 0) progressCallback( (ti / tot) * 100 )
  })

  return tilesWithIndex
}
  
function findSeeds(clusterer)
{
  return clusterer.getClusterCenters()
}
  
function assignTileToSeed(t, seeds, distanceParam)
{
  let minDist = Infinity
  let seedi = -1
  seeds.forEach( (s,i) => {
    let d = distance(t,s, distanceParam)
    if (d  < minDist) {
      minDist = d
      seedi = i
    }
  })
  
  return seedi
}

function findBestMatch(t, tiles, distanceParam, numCol, penalties, index)
{
  let minDist = Infinity
  let best = tiles[0]
  tiles.forEach( (tt,tti) => {
    let d = distance(t,tt.d, distanceParam)
    let tileshort = tt.d.name.toString().slice(0, -1)
    let penalty = (penalties[tileshort] ? penalties[tileshort] : 0) * 0.1 * d
    if (penalty && !isNaN(penalty)) {
      d += penalty
      //console.log(`Distance ${d} with penalty ${penalty}`)
    }
    
    if (d  < minDist) {
      minDist = d
      best = tt
      if (!tt) console.error('WHAT??')
    }
  })

  return best
}
  
export {serverRender, distributeCollectionsItems, distributeTargetTiles, findSeeds, assignTileToSeed, findBestMatch, solveTiles, flipTile, fillShallowClusters}