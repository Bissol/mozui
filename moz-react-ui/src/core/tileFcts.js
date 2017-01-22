// Display server tile at given position in a canvas
function displayInCanvas(tile, canvas, i, j, size, txt)
{
  if (!tile) return
  const x = i * size
  const y = j * size
  var ctx = canvas.getContext("2d")
  const numColRow = Math.sqrt(tile.nbsub)
  var subsize = size / numColRow
  for (var si=0; si<numColRow; si++)
    {
      for (var sj=0; sj<numColRow; sj++)
        {
          ctx.beginPath()
          ctx.rect(x + si*subsize, y + sj*subsize, subsize, subsize)
          const col = tile.colors[si*numColRow + sj]
          ctx.fillStyle = "rgba("+col.r+", "+col.g+", "+col.b+", 1)"
          ctx.fill()
        }
    }
  
  ctx.strokeStyle = "white"
  ctx.strokeRect(x, y, size, size)
  ctx.strokeStyle = "red"
  if (txt) ctx.strokeText(txt,x+size/2,y+size/2)
  //ctx.addHitRegion({id: "bigGreen"})
  //console.log('rect at ' + x + ' ' + y + ' of size ' + size)
}

// Makes a tiled canvas with color info
function makeTilesCanvas(tileArray, numCol, numRow, tileSize, canv)
{
  let canvas
  if (canv) {
    canvas = canv
  }
  else {
    canvas = document.createElement('canvas')
  }
  
  for (var i=0; i<numCol; i++) {
    for (var j=0; j<numRow; j++) {
      let tile = tileArray[i + numCol*j]
      displayInCanvas(tile, canvas, i, j, tileSize)
    }
  }
  
  return canvas
}

// Disp cluster centers for debug
function dispClustersDBG(canvas, clusters, clusterSizes, collections)
{
  clusters.forEach( (c,i) => {
    displayInCanvas(c, canvas, i%10, Math.floor(i/10), 30, i+1)
    console.log('Cluster ' + (i+1) + ' (size = ' + clusterSizes[i] + ') -> ' + collections[i].length + ' photos')
  })
}

// Disp collection samples for cluster (debug)
function dispSamplesForClusters(div, clusters, collections)
{
  collections.forEach( (item, itemi) => {
    var iDiv = document.createElement('div')
    var span = document.createElement('span')
    span.innerHTML = (itemi+1) + '  - ' + item.length + ' elements'
    iDiv.appendChild(span)
    for (var i=0; i<40; i+=4) {
      if (item.length <= i) continue;
      var img = document.createElement('img');
      img.src= 'http://debarena.com/moz/data/tiles/' + item[i].c + '/' + item[i].d.name;
      img.width = 30
      iDiv.appendChild(img)
    }
    div.appendChild(iDiv)
  })
}