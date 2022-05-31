export const calculatePoint = (point, offset, rate, normal) => {
  let p = Math.round((point - offset) * rate)

  //偏移超过图片范围，不显示
  if (p < 0) {
    p = 0
  }
  if (p > normal) {
    p = normal
  }
  return p
}

export const calculatePolyOffset = (oCoords, left, top) => {
  const xArr = [] as any
  const yArr = [] as any
  const oldPoints = [] as any
  const keys = Object.keys(oCoords)
  keys.map(key => {
    // points 缩放拖动之后无效,用oCoords替代
    oldPoints.push({
      x: oCoords[key].x,
      y: oCoords[key].y,
    })
    xArr.push(oCoords[key].x)
    yArr.push(oCoords[key].y)
  })
  const xMin = Math.min(...xArr)
  const yMin = Math.min(...yArr)
  const xOffset = xMin - left
  const yOffset = yMin - top
  const points = [] as any
  oldPoints.map(point => {
    points.push({
      x: point.x - xOffset,
      y: point.y - yOffset,
    })
  })
  return points
}

export const imgShuffle = arr => {
  let currentIndex = arr.length,
    randomIndex
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex],
    ]
  }
  return arr
}
