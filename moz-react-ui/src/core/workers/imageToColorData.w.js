let targetFcts = require('../targetFunctions.js')

self.addEventListener('message', function(e) {

  var data = e.data

  switch (data.cmd) {
    case 'start':
      //let res = targetFcts.extractColorInfo2(data.pixels, data.width, data.height, data.numCol, data.numRow, data.tileSize, data.matchSize, data.pixSampling, progressCallback)
      let res = targetFcts.extractTile2(0, 0, 150, 4, data.pixelData, 4)
      self.postMessage({type: 'result', data : res})
      break;
    
    default:
      self.postMessage('Unknown command: ' + data.msg)
  }
}, false)