'use strict'

export class TemperatureMap {
  ctx: any
  points: any[]
  polygon: any[]
  limits: { xMin: number; xMax: number; yMin: number; yMax: number }
  size: { height: number; width: number }
  width: number = 0
  height: number = 0
  minTemp: number = 22
  maxTemp: number = 32

  constructor(ctx: any) {
    this.ctx = ctx
    this.points = []
    this.polygon = []
    this.limits = {
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0
    }
    this.size = { height: ctx.canvas.height, width: ctx.canvas.width }
  }

  crossProduct(o: any, a: any, b: any) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  }

  pointInPolygon(point: any, vs: any) {
    var x = point.x,
      y = point.y,
      inside = false,
      i = 0,
      j = 0,
      xi = 0,
      xj = 0,
      yi = 0,
      yj = 0,
      intersect = false

    j = vs.length - 1
    for (i = 0; i < vs.length; i = i + 1) {
      xi = vs[i].x
      yi = vs[i].y
      xj = vs[j].x
      yj = vs[j].y

      intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
      if (intersect) {
        inside = !inside
      }
      j = i
    }

    return inside
  }

  squareDistance(p0: any, p1: any) {
    var x = p0.x - p1.x,
      y = p0.y - p1.y

    return x * x + y * y
  }

  hslToRgb(h: any, s: any, l: any) {
    var r, g, b, hue2rgb, q, p

    if (s === 0) {
      r = g = b = l
    } else {
      hue2rgb = function hue2rgb(p: any, q: any, t: any) {
        if (t < 0) {
          t += 1
        } else if (t > 1) {
          t -= 1
        }

        if (t >= 0.66) {
          return p
        } else if (t >= 0.5) {
          return p + (q - p) * (0.66 - t) * 6
        } else if (t >= 0.33) {
          return q
        } else {
          return p + (q - p) * 6 * t
        }
      }

      q = l < 0.5 ? l * (1 + s) : l + s - l * s
      p = 2 * l - q
      r = hue2rgb(p, q, h + 0.33)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 0.33)
    }

    return [(r * 255) | 0, (g * 255) | 0, (b * 255) | 0] // (x << 0) = Math.floor(x)
  }

  getColor(levels: any, value: any) {
    var val = value,
      tmp = 0,
      lim = 0.55,
      min = this.minTemp,
      max = this.maxTemp,
      dif = max - min,
      lvs = 10

    if (val < min) {
      val = min
    }
    if (val > max) {
      val = max
    }

    tmp = 1 - (1 - lim) - ((val - min) * lim) / dif

    if (levels) {
      tmp = Math.round(tmp * lvs) / lvs
    }

    return this.hslToRgb(tmp, 1, 0.5)
  }

  getPointValue(limit: any, point: any) {
    var counter = 0,
      arr = [],
      tmp = 0.0,
      dis = 0.0,
      inv = 0.0,
      t = 0.0,
      b = 0.0,
      pwr = 2,
      ptr

    // From : https://en.wikipedia.org/wiki/Inverse_distance_weighting

    for (counter = 0; counter < this.points.length; counter = counter + 1) {
      dis = this.squareDistance(point, this.points[counter])
      if (dis === 0) {
        return this.points[counter].value
      }
      arr[counter] = [dis, counter]
    }

    arr.sort(function (a, b) {
      return a[0] - b[0]
    })

    for (counter = 0; counter < limit; counter = counter + 1) {
      ptr = arr[counter]
      inv = 1 / Math.pow(ptr[0], pwr)
      t = t + inv * this.points[ptr[1]].value
      b = b + inv
    }

    return t / b
  }

  setConvexhullPolygon(points: any) {
    var lower = [],
      upper = [],
      i = 0

    // Sort by 'y' to get yMin/yMax
    points.sort(function (a: any, b: any) {
      return a.y === b.y ? a.x - b.x : a.y - b.y
    })

    this.limits.yMin = 0
    this.limits.yMax = this.height

    // Sort by 'x' to get convex hull polygon and xMin/xMax
    points.sort(function (a: any, b: any) {
      return a.x === b.x ? a.y - b.y : a.x - b.x
    })

    this.limits.xMin = 0
    this.limits.xMax = this.width

    // Get convex hull polygon from points sorted by 'x'
    for (i = 0; i < points.length; i = i + 1) {
      while (
        lower.length >= 2 &&
        this.crossProduct(
          lower[lower.length - 2],
          lower[lower.length - 1],
          points[i]
        ) <= 0
      ) {
        lower.pop()
      }
      lower.push(points[i])
    }

    for (i = points.length - 1; i >= 0; i = i - 1) {
      while (
        upper.length >= 2 &&
        this.crossProduct(
          upper[upper.length - 2],
          upper[upper.length - 1],
          points[i]
        ) <= 0
      ) {
        upper.pop()
      }
      upper.push(points[i])
    }

    //upper.pop()
    //lower.pop()
    this.polygon = lower.concat(upper)
  }

  setPoints(arr: any, width: any, height: any) {
    this.points = arr
    this.width = width
    this.height = height
    this.setConvexhullPolygon(this.points)
  }

  setRandomPoints(points: any, width: any, height: any) {
    var counter = 0,
      x = 0,
      y = 0,
      v = 0.0,
      rst = []

    for (counter = 0; counter < points; counter = counter + 1) {
      x = parseInt(((Math.random() * 100000) % width) as unknown as string, 10)
      y = parseInt(((Math.random() * 100000) % height) as unknown as string, 10)
      v = (Math.random() * 100) / 2

      if (Math.random() > 0.5) {
        v = -v
      }
      if (Math.random() > 0.5) {
        v = v + 30
      }

      rst.push({ x: x, y: y, value: v })
    }

    this.setPoints(rst, width, height)
  }

  drawLow(limit: any, res: any, clean: any, callback: any) {
    var self = this,
      ctx = this.ctx,
      dbl = 2 * res,
      col = [],
      cnt = 0,
      x = 0,
      y = 0,
      val = 0.0,
      str = '',
      xBeg = self.limits.xMin,
      yBeg = self.limits.yMin,
      xEnd = self.limits.xMax,
      yEnd = self.limits.yMax,
      lim = limit > self.points.length ? self.points.length : limit + 1,
      gradient

    ctx.clearRect(0, 0, this.size.width, this.size.height)
    ctx.width += 0 //<=== Resizing the canvas will cause the canvas to get cleared.

    // Draw aproximation
    for (x = xBeg; x < xEnd; x = x + res) {
      for (y = yBeg; y < yEnd; y = y + res) {
        val = self.getPointValue(lim, { x: x, y: y })
        if (val !== -255) {
          ctx.beginPath() //<== beginpath
          col = self.getColor(false, val)
          str = 'rgba(' + col[0] + ', ' + col[1] + ', ' + col[2] + ', '
          gradient = ctx.createRadialGradient(x, y, 1, x, y, res)
          gradient.addColorStop(0, str + '0.5)')
          gradient.addColorStop(1, str + '0)')
          ctx.fillStyle = '#191919' //<=== must be filled white for properly render
          ctx.fillStyle = gradient
          ctx.fillRect(x - res, y - res, dbl, dbl)
          ctx.fill()
          ctx.closePath() //<== must be closed
        }
      }
    }

    // Erase polygon outsides
    if (clean && self.polygon.length > 1) {
      ctx.globalCompositeOperation = 'destination-in'
      ctx.fillStyle = 'rgb(255, 255, 255)'
      ctx.beginPath()
      ctx.moveTo(self.polygon[0].x, self.polygon[0].y)
      for (cnt = 1; cnt < self.polygon.length; cnt = cnt + 1) {
        ctx.lineTo(self.polygon[cnt].x, self.polygon[cnt].y)
      }
      ctx.lineTo(self.polygon[0].x, self.polygon[0].y)
      ctx.closePath()
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
    }

    if (typeof callback === 'function') {
      callback()
    }
  }

  async drawFull(levels: any) {
    'use strict'
    return new Promise<void>((resolve, reject) => {
      var self = this,
        ctx = this.ctx,
        img = this.ctx.getImageData(0, 0, self.width, self.height),
        data = img.data,
        step = 0,
        col = [],
        cnt = 0,
        idx = 0,
        x = self.limits.xMin,
        y = self.limits.yMin,
        w = self.width * 4,
        wy = w * y,
        lim = self.points.length,
        val = 0.0,
        tBeg = 0,
        tDif = 0,
        xBeg = self.limits.xMin,
        xEnd = self.limits.xMax,
        yEnd = self.limits.yMax,
        bucleSteps = 100.0,
        recursive = function () {
          //window.requestAnimationFrame(function (timestamp) {
          tBeg = new Date().getTime()
          for (cnt = 0; cnt < bucleSteps; cnt = cnt + 1) {
            val = self.getPointValue(lim, { x: x, y: y })
            idx = x * 4 + wy
            if (val !== -255) {
              col = self.getColor(levels, val)
              data[idx] = col[0]
              data[idx + 1] = col[1]
              data[idx + 2] = col[2]
              data[idx + 3] = 128
            }
            x = x + 1
            if (x > xEnd) {
              x = xBeg
              y = y + 1
              wy = w * y
            }
          }

          tDif = new Date().getTime() - tBeg
          if (tDif === 0) {
            tDif = 1
          }
          // bucleSteps = ((16 * bucleSteps) / tDif) * 0.5;
          bucleSteps = (bucleSteps << 3) / tDif

          ctx.putImageData(img, 0, 0)

          if (y < yEnd) {
            recursive()
          } else {
            resolve()
          }
          //})
        }

      recursive()
    })
  }

  drawRightAlignedPoints(rightAlignedPoints: any) {
    return this.drawPoints(rightAlignedPoints, 'right')
  }

  drawLeftAlignedPoints(leftAlignedPoints: any) {
    return this.drawPoints(leftAlignedPoints, 'left')
  }

  drawPoints(points: any, alignment: any) {
    return new Promise<void>((resolve, reject) => {
      var self = this,
        PI2 = 2 * Math.PI,
        ctx = this.ctx
      //window.requestAnimationFrame(function (timestamp) {
      var col = [],
        idx = 0,
        pnt

      let xDelta
      if (alignment === 'left') {
        xDelta = 8
      } else {
        xDelta = 28
      }

      for (idx = 0; idx < points.length; idx = idx + 1) {
        pnt = points[idx]

        col = self.getColor(false, pnt.value)

        ctx.fillStyle = 'rgba(255, 255, 255, 128)'
        ctx.beginPath()
        ctx.fillRect(pnt.x - xDelta, pnt.y - 8, 35, 16)
        //ctx.fill()

        /*ctx.lineWidth = 1
        ctx.strokeStyle = 'rgb(' + col[0] + ', ' + col[1] + ', ' + col[2] + ')'
        ctx.beginPath()
        ctx.arc(pnt.x, pnt.y, 8, 0, PI2, false)
        ctx.stroke()*/

        ctx.font = '10px sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = 'rgb(0, 0, 0)'
        ctx.fillText(pnt.value.toFixed(1) + '°C', pnt.x - xDelta + 2, pnt.y)
      }

      resolve()
    })
  }

  drawOutsideTemp(temp: any) {
    return new Promise<void>((resolve, reject) => {
      if (!temp) resolve()
      this.ctx.fillStyle = 'rgba(255, 255, 255, 128)'
      this.ctx.fillRect(0, temp.y - 20, 82, 40)

      this.ctx.font = '10px sans-serif'
      this.ctx.textAlign = 'left'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillStyle = 'rgb(0, 0, 0)'
      this.ctx.fillText('Außentemperatur', temp.x + 2, temp.y - 12)
      this.ctx.fillText(temp.value.toFixed(1) + '°C', temp.x + 2, temp.y)
      this.ctx.fillText('<------', temp.x + 2, temp.y + 12)
      resolve()
    })
  }

  drawScale(ratio: number) {
    return new Promise<void>((resolve, reject) => {
      const x = 1665 * ratio
      const y = 1070 * ratio
      const width = 220 * ratio
      const height = 25 * ratio
      this.ctx.fillStyle = 'rgb(0, 0, 0)'
      this.ctx.fillRect(x, y, width, height)

      const tempMiddle = (this.minTemp + this.maxTemp) / 2
      const tempStartMiddle = (this.minTemp + tempMiddle) / 2
      const tempEndMiddle = (tempMiddle + this.maxTemp) / 2

      // Create linear gradient
      const startColorArray = this.getColor(false, this.minTemp)
      const startMiddleColorArray = this.getColor(false, tempStartMiddle)
      const middleColorArray = this.getColor(false, tempMiddle)
      const endMiddleColorArray = this.getColor(false, tempEndMiddle)
      const endColorArray = this.getColor(false, this.maxTemp)
      const startColor = this.createRgbValue(startColorArray)
      const startMiddleColor = this.createRgbValue(startMiddleColorArray)
      const middleColor = this.createRgbValue(middleColorArray)
      const endMiddleColor = this.createRgbValue(endMiddleColorArray)
      const endColor = this.createRgbValue(endColorArray)
      const grad = this.ctx.createLinearGradient(x + 1, y + 1, x + width - 2, y)
      grad.addColorStop(0, startColor)
      grad.addColorStop(0.25, startMiddleColor)
      grad.addColorStop(0.5, middleColor)
      grad.addColorStop(0.75, endMiddleColor)
      grad.addColorStop(1, endColor)

      // Fill rectangle with gradient
      this.ctx.fillStyle = 'rgb(255,255,255)'
      this.ctx.fillRect(x + 1, y + 1, width - 2, height - 2)
      this.ctx.fillStyle = grad
      this.ctx.fillRect(x + 1, y + 1, width - 2, height - 2)

      this.ctx.fillStyle = 'rgb(0,0,0)'
      this.ctx.fillRect(x, y + height, 1, 5)
      this.ctx.fillRect(x + width - 1, y + height, 1, 5)
      this.ctx.fillRect(x + width / 2, y + height, 1, 5)
      this.ctx.fillRect(x + width / 4, y + height, 1, 5)
      this.ctx.fillRect(x + width / 2 + width / 4, y + height, 1, 5)

      this.ctx.font = '10px sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.fillStyle = 'rgb(0, 0, 0)'
      this.ctx.fillText(this.minTemp, x, y + height + 10)
      this.ctx.fillText(this.maxTemp, x + width - 1, y + height + 10)
      this.ctx.fillText(tempMiddle, x + width / 2, y + height + 10)
      this.ctx.fillText(tempStartMiddle, x + width / 4, y + height + 10)
      this.ctx.fillText(
        tempEndMiddle,
        x + width / 2 + width / 4,
        y + height + 10
      )
      resolve()
    })
  }

  createRgbValue(tempArray: number[]) {
    return (
      'rgba(' +
      tempArray[0] +
      ',' +
      tempArray[1] +
      ',' +
      tempArray[2] +
      ', 0.5)'
    )
  }
}
