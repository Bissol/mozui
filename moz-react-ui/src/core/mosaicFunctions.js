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
  
function computeFastIndex()
{
  let seeds = findSeeds()
  distributeCollectionsItems(seeds)
}

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
function distributeCollectionsItems(seeds, collections, allowTileFlip)
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
    let idx = assignTileToSeed(item, seeds)
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


// Returns an array where tiles are reorganized according to seed similarity
function distributeTargetTiles(seeds, tiles) {
  let result = new Array(seeds.length)
  seeds.forEach( (s,i) => {
     result[i] = []
   })

  tiles.forEach( (t, ti) => {
    result[assignTileToSeed(t, seeds)].push({tile: t, index: ti})
  })

  return result
}

// input: {tile: colorinfo, index : idx} Result : {tile:, index:, match: indexedCollItem}
function solveTiles(tilesWithIndex, indexedCollection, progressCallback) {
  const tot = tilesWithIndex.length
  tilesWithIndex.forEach( (t, ti) => {
    let best = findBestMatch(t.tile, indexedCollection)
    tilesWithIndex[ti].match = best
    if (ti % 10 === 0) progressCallback( (ti / tot) * 100 )
  })

  return tilesWithIndex
}
  
function findSeeds(clusterer)
{
  return clusterer.getClusterCenters()
}
  
function assignTileToSeed(t, seeds)
{
  let minDist = -1
  let seedi = -1
  seeds.forEach( (s,i) => {
    let d = distance(t,s)
    if (minDist === -1 || d  < minDist) {
      minDist = d
      seedi = i
    }
  })
  
  return seedi
}
  
function findBestMatch(t, tiles)
{
  let minDist = Infinity
  let best = undefined
  tiles.forEach( (tt,tti) => {
    let d = distance(t,tt.d)
    if (d  < minDist) {
      minDist = d
      best = tiles[tti]
    }
  })
  return best
}
  
export {serverRender, computeFastIndex, distributeCollectionsItems, distributeTargetTiles, findSeeds, assignTileToSeed, findBestMatch, solveTiles, flipTile}