let distanceFcts = require('../distance.js')
let mosaicFcts = require('../mosaicFunctions.js')

self.addEventListener('message', function(e) {

  let data = e.data
  let id = data.worker_id

  let progressCallback = (nbSolved) => {
  	self.postMessage({type: 'progress', worker_id: id, nbSolved : nbSolved})
  }

  switch (data.cmd) {
    case 'start':
      let res = mosaicFcts.solveTiles(data.tilesWithIndex, data.indexedCollection, data.distanceParam, data.repetitionParam, data.numCol, progressCallback)
      self.postMessage({type: 'result', solvedSubset : res})
      break;
    
    default:
      self.postMessage('Unknown command: ' + data.msg)
  }
}, false)