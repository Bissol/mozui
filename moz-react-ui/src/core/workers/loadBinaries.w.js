let collectionLoader = require('../collectionLoader.js')

self.addEventListener('message', function(e) {

  var data = e.data

  let callback = (res) => {
    self.postMessage({type: 'result', collec: res})
  }

  let progressCallback = (percent) => {
    self.postMessage({type: 'progress', percent : percent})
  }

  switch (data.cmd) {
    case 'start':
      collectionLoader.loadCollectionJson(data.collectionName, callback, progressCallback)
      break;
    
    default:
      self.postMessage('Unknown command: ' + data.msg)
  }
}, false)