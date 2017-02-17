let jBinary = require('jbinary')

// TypeSet Version 1
  var typeSet = {
    'jBinary.littleEndian': true,
    header: {version : 'uint8', count: 'uint32'},
    rgb: {r: 'uint8', g: 'uint8', b: 'uint8'},
    tile: {charcount: 'uint8', name: ['string', 'charcount'], nbsub: 'uint8', avg: 'rgb', colors: ['array', 'rgb', 'nbsub']}
  };

let baseUrl = "http://debarena.com/moz/data/tiles"


function loadCollectionJson(collectionName, callback)
{
  let t0 = performance.now()
  let url = baseUrl + '/' + collectionName + '/data.bin'
  
  jBinary.load(url, typeSet, (err, binary) => {
    const head = binary.read('header')
    var res = {}
    res.name = collectionName
    res.data = []
    for (var r=0; r<head.count;r++) {
      const item = binary.read('tile')
      res.data.push(item)
    }
    let t1 = performance.now();
    console.log("Loading collection " + collectionName + " took " + (t1 - t0) + " milliseconds.")
    callback(res)
  });
}

export {loadCollectionJson};