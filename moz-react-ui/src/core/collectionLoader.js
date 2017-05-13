let jBinary = require('jbinary')

// TypeSet Version 1
  var typeSet = {
    'jBinary.littleEndian': true,
    header: {version : 'uint8', count: 'uint32'},
    rgb: {r: 'uint8', g: 'uint8', b: 'uint8'},
    tile: {charcount: 'uint8', name: ['string', 'charcount'], nbsub: 'uint8', avg: 'rgb', colors: ['array', 'rgb', 'nbsub']}
  };

  // TypeSet Version 2
  var typeSet_v2 = {
    'jBinary.littleEndian': true,
    header: {version : 'uint8', count: 'uint32'},
    rgb: {r: 'uint8', g: 'uint8', b: 'uint8'},
    tile: {name: 'uint16', nbsub: 'uint8', avg: 'rgb', colors: ['array', 'rgb', 'nbsub']}
  };

let baseUrl = "http://debarena.com/moz/data/tiles"


function loadCollectionJson(collectionName, callback, progressCallback)
{
  let t0 = performance.now()
  let url = baseUrl + '/' + collectionName + '/data.bin'
  progressCallback(0)

  jBinary.load(url, typeSet_v2, (err, binary) => {
    let t1 = performance.now()
    console.log(`Loading binary ${collectionName} took ${t1 - t0}ms`)
    const head = binary.read('header')
    var res = {}
    res.name = collectionName
    res.data = []
    for (var r=0; r<head.count;r++) {
      if (r%100 === 0) {
        progressCallback(Math.round(r / head.count * 100))
      }
      const item = binary.read('tile')
      res.data.push(item)
    }
    
    let t2 = performance.now()
    console.log(`Processing binary took ${t2 - t1}ms`)
    callback(res)
  });
}

export {loadCollectionJson};