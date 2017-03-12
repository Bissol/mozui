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
  
function distributeCollectionsItems(seeds, collections)
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
  
  let func = (item, collec) => {
    let idx = assignTileToSeed(item, seeds)
    indexedCollections[idx].push({c:collec.name, d:item})
    tot++
  }

  for (let key in collections) {
    if(collections.hasOwnProperty(key)) {
      let collec = collections[key]
      collec.data.forEach( item => func(item, collec))
    }
  }
  
  let t1 = performance.now();
  console.log("Indexing " + tot + " items took " + (t1 - t0) + " milliseconds.")

  return indexedCollections
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
  
export {serverRender, computeFastIndex, distributeCollectionsItems, findSeeds, assignTileToSeed, findBestMatch}