
// Extract tiles from an image
function extractColorInfo(imageElement, numCol, numRow, tileSize, matchSize, pixSampling, progressCallback)
{
  // Draw image to canvas
  let canvas = document.createElement('canvas')
  let context = canvas.getContext('2d')
  canvas.width = imageElement.width
  canvas.height = imageElement.height
  context.drawImage(imageElement, 0, 0)

  // Create structure
  let colorData = new Array(numCol * numRow)

  // Fill structure
  for (var i=0; i<numCol; i++) {
      for (var j=0; j<numRow; j++) {
        colorData[i + j*numCol] = extractTile(i,j, tileSize, matchSize, context, pixSampling)
      }

      if (progressCallback) {progressCallback(Math.round((i/numCol)*100))}
  }

  console.log('Extracted ' + colorData.length + ' regions from target image')
  return colorData
}

function extractEdges(pixels, width, height, progressCallback)
{
  // Make an empty image data
  let raw_result = new Uint8ClampedArray(pixels.data.length)

  // Iterate over image
  for (let x=0; x<width; x++) {
    progressCallback(Math.round(100 * (x / width)))
    for (let y=0; y<height; y++) {
      let roughness = getRoughnessAt(pixels, x, y, 2, width, 1)
      let alpha = roughness * 0
      raw_result[((y * (pixels.width * 4)) + (x * 4)) + 0] = pixels.data[((y * (pixels.width * 4)) + (x * 4)) + 0]
      raw_result[((y * (pixels.width * 4)) + (x * 4)) + 1] = pixels.data[((y * (pixels.width * 4)) + (x * 4)) + 1]
      raw_result[((y * (pixels.width * 4)) + (x * 4)) + 2] = pixels.data[((y * (pixels.width * 4)) + (x * 4)) + 2]
      raw_result[((y * (pixels.width * 4)) + (x * 4)) + 3] = alpha
    }
  }

  // Result image data
  let imageData = new ImageData(raw_result, pixels.width, pixels.height)
  return imageData
}

function getRoughnessAt(pixels, x, y, half_square, width, step) {
  let count = 0
  let diff = 0
  let rgb = {r:0,g:0,b:0}
  let rawSize = pixels.data.length

  let center = {r: pixels.data[((y * (pixels.width * 4)) + (x * 4)) + 0], g: pixels.data[((y * (pixels.width * 4)) + (x * 4)) + 1], b: pixels.data[((y * (pixels.width * 4)) + (x * 4)) + 2]}
  // let center_grey = pixels.data[((y * (pixels.width * 4)) + (x * 4)) + 0]
  //                   + pixels.data[((y * (pixels.width * 4)) + (x * 4)) + 1]
  //                   + pixels.data[((y * (pixels.width * 4)) + (x * 4)) + 2]
  // center_grey = center_grey / 3

  for (let i = x - half_square ; i <= x + half_square; i += step) {
    for (let j = y - half_square ; j <= y + half_square; j += step) {
      if (((j * (pixels.width * 4)) + (i * 4)) < rawSize) {
        rgb.r = pixels.data[((j * (pixels.width * 4)) + (i * 4)) + 0]
        rgb.g = pixels.data[((j * (pixels.width * 4)) + (i * 4)) + 1]
        rgb.b = pixels.data[((j * (pixels.width * 4)) + (i * 4)) + 2]
        //grey = grey / 3
        diff += Math.sqrt(Math.pow(center.r - rgb.r, 2) + Math.pow(center.g - rgb.g, 2) + Math.pow(center.b - rgb.b, 2))
        ++count
      }
    }
  }

  diff = diff / count
  return diff
}

// Extract tiles from an image
function extractColorInfo2(pixels, width, height, numCol, numRow, tileSize, matchSize, pixSampling, progressCallback)
{
  // Create structure
  let colorData = new Array(numCol * numRow)

  // Fill structure
  for (var i=0; i<numCol; i++) {
      for (var j=0; j<numRow; j++) {
        colorData[i + j*numCol] = extractTile2(i,j, tileSize, matchSize, pixels, pixSampling)
      }

      if (progressCallback) {progressCallback(Math.round((i/numCol)*100))}
  }

  console.log('Extracted ' + colorData.length + ' regions from target image')
  return colorData
}

// Extract one tile from an image
function extractTile(i,j, tileSize, matchSize, context, pixSampling)
{
  let colors = []
  const subsize = Math.round(tileSize / matchSize)
  const x = i * tileSize
  const y = j * tileSize
  let avgrgb = {r:0,g:0,b:0}
  let count = 0
  for (var dx=0; dx<matchSize; dx++) {
      for (var dy=0; dy<matchSize; dy++) {
        const c = extractRegion( x + (dx*subsize),y + (dy * subsize),subsize, context, pixSampling)
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
  
  let res = {nbsub:matchSize * matchSize, avg: avgrgb, colors: colors}
  
  return res
}

// Extract one tile from an image
function extractTile2(i,j, tileSize, matchSize, pixels, pixSampling)
{
  let colors = []
  const subsize = Math.round(tileSize / matchSize)
  const x = i * tileSize
  const y = j * tileSize
  let avgrgb = {r:0,g:0,b:0}
  let count = 0
  for (var dx=0; dx<matchSize; dx++) {
      for (var dy=0; dy<matchSize; dy++) {
        const c = extractRegion2( x + (dx*subsize),y + (dy * subsize),subsize, pixels, pixSampling)
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
  
  let res = {nbsub:matchSize * matchSize, avg: avgrgb, colors: colors}
  
  return res
}

// Extract a square of pixels
function extractRegion(x,y, subsize, context, pixSampling)
{
  let data = context.getImageData(x, y, subsize, subsize)
  let rgb = {r:0,g:0,b:0}
  let count = 0
  const length = data.data.length;
  
  let ii = pixSampling * 4
  while ( ii < length ) {
      ++count
      rgb.r += data.data[ii]
      rgb.g += data.data[ii+1]
      rgb.b += data.data[ii+2]
      ii += pixSampling * 4
  }

  // Averaging
  rgb.r = ~~(rgb.r/count)
  rgb.g = ~~(rgb.g/count)
  rgb.b = ~~(rgb.b/count)
  //if (rgb.r === 0 && rgb.g === 0 && rgb.b === 0) console.error('Problem in region (' + x + ',' + y + ') of size ' + subsize)
  return rgb
}

// Extract a square of pixels
function extractRegion2(x0 ,y0 , subsize, pixels, pixSampling)
{
  let rawSize = pixels.data.length
  let rgb = {r:0,g:0,b:0}
  let count = 0
  for (let x = x0; x < x0 + subsize; x++) {
    for (let y = y0; y < y0 + subsize; y++) {
      // OK... Try to get pixel value
      if (((y * (pixels.width * 4)) + (x * 4)) < rawSize) {
        rgb.r += pixels.data[((y * (pixels.width * 4)) + (x * 4)) + 0]
        rgb.g += pixels.data[((y * (pixels.width * 4)) + (x * 4)) + 1]
        rgb.b += pixels.data[((y * (pixels.width * 4)) + (x * 4)) + 2]
        ++count
      }
    }
  }

  // Averaging
  rgb.r = ~~(rgb.r/count)
  rgb.g = ~~(rgb.g/count)
  rgb.b = ~~(rgb.b/count)
if (rgb.r === 0 && rgb.g === 0 && rgb.b === 0) console.error('Problem in region (' + x0 + ',' + y0 + ') of size ' + subsize)
  return rgb
}

export {extractRegion, extractTile2, extractColorInfo, extractColorInfo2, extractEdges}