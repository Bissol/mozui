let targetFcts = require('../targetFunctions.js')

self.addEventListener('message', function(e) {

  var data = e.data

  let progressCallback = (percent) => {
  	self.postMessage({type: 'progress', percent : percent})
  }

  switch (data.cmd) {
    case 'start':
      let res = targetFcts.extractColorInfo2(data.pixels, data.width, data.height, data.numCol, data.numRow, data.tileSize, data.matchSize, data.pixSampling, progressCallback)
      self.postMessage({type: 'result', data : res})
      break;
    
    default:
      self.postMessage('Unknown command: ' + data.msg)
  }
}, false)