class Target {
  
  constructor(imageElement) {
    this.imageElement = imageElement
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
    this.width = imageElement.clientWidth
    this.height = imageElement.clientHeight
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.context.drawImage(imageElement, 0, 0)
    this.numColRow
    this.numCol
    this.numRow
    this.tileSize
    this.setNumColRow(50)
    this.pixSampling = 2
    this.matchSize = 4
    this.colorData = []
  }
  
  setNumColRow(ncr)
  {
    this.numColRow = ncr
    this.numCol = this.width > this.height ? this.numColRow : Math.round(this.numColRow * (this.width / this.height))
    this.numRow = this.width <= this.height ? this.numColRow : Math.round(this.numColRow * (this.height / this.width))
    this.tileSize = Math.round(this.width / this.numCol)
    this.colorData = new Array(this.numCol * this.numRow)
  }
  
  extractColorInfo()
  {
    for (var i=0; i<this.numCol; i++) {
        for (var j=0; j<this.numRow; j++) {
          this.colorData[i + j*this.numCol] = this.extractTile(i,j)
        }
    }
  }
  
  extractTile(i,j)
  {
    let colors = []
    const subsize = Math.round(this.tileSize / this.matchSize)
    const x = i * this.tileSize
    const y = j * this.tileSize
    let avgrgb = {r:0,g:0,b:0}
    for (var dx=0; dx<this.matchSize; dx++) {
        for (var dy=0; dy<this.matchSize; dy++) {
          const c = this.extractRegion( x + (dx*subsize),y + (dy * subsize),subsize)
          colors.push(c)
          avgrgb.r += c.r
          avgrgb.g += c.g
          avgrgb.b += c.b
        }
    }
    
    // Averaging
    const count = this.matchSize * this.matchSize
    avgrgb.r = ~~(avgrgb.r/count)
    avgrgb.g = ~~(avgrgb.g/count)
    avgrgb.b = ~~(avgrgb.b/count)
    
    let res = {nbsub:this.matchSize*this.matchSize, avg: avgrgb, colors: colors}
    
    return res
  }
  
  extractRegion(x,y, subsize)
  {
    let data = this.context.getImageData(x, y, subsize, subsize)
    let rgb = {r:0,g:0,b:0}
    let count = 0
    const length = data.data.length;
    
    let ii=0
    while ( (ii += this.pixSampling * 4) < length ) {
        ++count
        rgb.r += data.data[ii]
        rgb.g += data.data[ii+1]
        rgb.b += data.data[ii+2]
    }

    // Averaging
    rgb.r = ~~(rgb.r/count)
    rgb.g = ~~(rgb.g/count)
    rgb.b = ~~(rgb.b/count)
    if (rgb.r === 0) console.log('No red in region ' + x + ',' + y + ' of size ' + subsize)
    return rgb
  }
}