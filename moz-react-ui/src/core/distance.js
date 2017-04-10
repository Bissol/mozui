
function distance(t1, t2, distanceParam)
{
  // {nbsub:this.matchSize*this.matchSize, avg: avgrgb, colors: colors}
  if (!t1 || !t2) { debugger}
  if (t1.nbsub !== t2.nbsub) {
    console.log("Cant't compare tiles")
    return 1
  }
  
  let res = 0
  for(let i=0; i<t1.nbsub; i++)
    {
      // let hsv1 = RGBtoHSV(t1.colors[i])
      // let hsv2 = RGBtoHSV(t2.colors[i])
      // const dH = Math.abs(hsv1.h - hsv2.h)
      // const dS = Math.abs(hsv1.s - hsv2.s)
      // const dV = Math.abs(hsv1.v - hsv2.v)

      // res += distanceParam * (dH + dS) +  (100 - distanceParam) * dV 

      let subdist = 0;

      // Color + intensity
      const dR = Math.abs(t1.colors[i].r - t2.colors[i].r)
      const dG = Math.abs(t1.colors[i].g - t2.colors[i].g)
      const dB = Math.abs(t1.colors[i].b - t2.colors[i].b)
      let rgbDist = dR + dG + dB
      
      // Pure intensity
      let intensityDist = Math.abs(intensity(t1.colors[i]) - intensity(t2.colors[i]))
      
      res += distanceParam * intensityDist + (100 - distanceParam) * rgbDist
    }
  
  return res
}

function intensity(rgb)
{
  return Math.round((rgb.r + rgb.g + rgb.b) / 3)
}

function merge(t1, w1, t2, w2, res)
{
  // {nbsub:this.matchSize*this.matchSize, avg: avgrgb, colors: colors}
  if (t1.nbsub !== t2.nbsub) {
    console.log("Cant't merge tiles")
    return 1
  }
  
  // color
  res.avg.r = Math.round((w1 * t1.avg.r + w2 * t2.avg.r) / (w1+w2))
  res.avg.g = Math.round((w1 * t1.avg.g + w2 * t2.avg.g) / (w1+w2))
  res.avg.b = Math.round((w1 * t1.avg.b + w2 * t2.avg.b) / (w1+w2))
  
  // Intensity
  /*let intens = Math.abs((w1 * intensity(t1.avg) + w2 * intensity(t2.avg)) / (w1+w2))
  res.avg.r = intens
  res.avg.g = intens
  res.avg.b = intens*/
  
  for(var i=0; i<t1.nbsub; i++)
    {
      // Colors
      res.colors[i].r = Math.round((w1 * t1.colors[i].r + w2 * t2.colors[i].r) / (w1+w2))
      res.colors[i].g = Math.round((w1 * t1.colors[i].g + w2 * t2.colors[i].g) / (w1+w2))
      res.colors[i].b = Math.round((w1 * t1.colors[i].b + w2 * t2.colors[i].b) / (w1+w2))
      
      // Intensity
      /*const intens = Math.abs((w1 * intensity(t1.colors[i]) + w2 * intensity(t2.colors[i])) / (w1+w2))
      res.colors[i].r = intens
      res.colors[i].g = intens
      res.colors[i].b = intens*/
    }
}

function RGBtoHSV(r, g, b) {
    if (arguments.length === 1) {
        g = r.g, b = r.b, r = r.r;
    }
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
        h: h,
        s: s,
        v: v
    };
}

export {distance, merge}