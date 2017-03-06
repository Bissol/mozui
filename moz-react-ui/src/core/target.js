class Target {
  
  constructor(imageSrcData, callback, initialNumColRow) {
    this.ready = false
    this.imageSrcData = imageSrcData
    this.imageElement = new Image()
    this.width = -1
    this.height = -1
    this.defaultNumColRow = 50
    this.numColRow = initialNumColRow ? initialNumColRow : this.defaultNumColRow
    this.numCol = 0
    this.numRow = 0
    this.tileSize = 0
    this.pixSampling = 2
    this.matchSize = 4
    this.colorData = []
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')

    this.imageElement.onload = () => {
      this.width = this.imageElement.width
      this.height = this.imageElement.height
      this.canvas.width = this.width
      this.canvas.height = this.height
      this.context.drawImage(this.imageElement, 0, 0)
      this.setNumColRow(this.numColRow)
      this.extractColorInfo()
      this.ready = true
      callback()
    }
    this.imageElement.src = imageSrcData
  }
  
  changeNumColRow(ncr) {
    this.setNumColRow(ncr)
    return new Promise( (resolve, reject) => {
      this.extractColorInfo()
      resolve()
    })
  }

  setNumColRow(ncr)
  {
    this.numColRow = ncr
    this.numCol = this.width > this.height ? this.numColRow : Math.round(this.numColRow * (this.width / this.height))
    this.numRow = this.width <= this.height ? this.numColRow : Math.round(this.numColRow * (this.height / this.width))
    const longSide = this.width > this.height ? this.width : this.height
    this.tileSize = Math.floor(longSide / this.numColRow)
    this.colorData = new Array(this.numCol * this.numRow)
    console.log('Target numColRow changed: (' + this.numCol + ',' + this.numRow + ') w:' + this.width + '/' + (this.numCol * this.tileSize) + ' - ' +  this.height + '/' + (this.numRow * this.tileSize))
  }
  
  extractColorInfo()
  {
    for (var i=0; i<this.numCol; i++) {
        for (var j=0; j<this.numRow; j++) {
          this.colorData[i + j*this.numCol] = this.extractTile(i,j)
        }
    }

    console.log('Extracted ' + this.colorData.length + ' regions from target image')
  }
  
  extractTile(i,j)
  {
    let colors = []
    const subsize = Math.round(this.tileSize / this.matchSize)
    const x = i * this.tileSize
    const y = j * this.tileSize
    let avgrgb = {r:0,g:0,b:0}
    let count = 0
    for (var dx=0; dx<this.matchSize; dx++) {
        for (var dy=0; dy<this.matchSize; dy++) {
          const c = this.extractRegion( x + (dx*subsize),y + (dy * subsize),subsize)
          if (c !== 0) {
            colors.push(c)
            avgrgb.r += c.r
            avgrgb.g += c.g
            avgrgb.b += c.b
            count++
          }
        }
    }
    
    // Averaging
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
    
    let ii = this.pixSampling * 4
    while ( ii < length ) {
        ++count
        rgb.r += data.data[ii]
        rgb.g += data.data[ii+1]
        rgb.b += data.data[ii+2]
        ii += this.pixSampling * 4
    }

    // Averaging
    rgb.r = ~~(rgb.r/count)
    rgb.g = ~~(rgb.g/count)
    rgb.b = ~~(rgb.b/count)
    //if (rgb.r === 0 && rgb.g === 0 && rgb.b === 0) console.error('Problem in region (' + x + ',' + y + ') of size ' + subsize)
    return rgb
  }
}

export default Target