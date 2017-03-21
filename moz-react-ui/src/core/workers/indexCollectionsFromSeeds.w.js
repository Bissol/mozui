let distanceFcts = require('../distance.js')
let mosaicFcts = require('../mosaicFunctions.js')

self.addEventListener('message', function(e) {

  var data = e.data

  switch (data.cmd) {
    case 'start':
      let res = mosaicFcts.distributeCollectionsItems(data.seeds, data.collections, data.allowTileFlip)
      self.postMessage({data : res})
      break;
    
    default:
      self.postMessage('Unknown command: ' + data.msg)
  }
}, false)