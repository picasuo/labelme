import { ExporterUtil, calculatePoint } from './ExporterUtil'

let filename = ''
let widthRate = 0
let heightRate = 0
let width = 0
let height = 0
let left = 0
let top = 0
let picList = [] as any
export const exportVGG = (data, pics, canvasWidth, canvasHeight) => {
  picList = pics
  let keys: any = Object.keys(data)
  let jsonData: any = {}
  keys.forEach(item => {
    filename = item
    const fileData = mapImagesDataToVGGObject(
      data[item],
      canvasWidth,
      canvasHeight
    )
    jsonData[filename] = fileData
  })
  const content = JSON.stringify(jsonData)
  const fileName = `数据集-${moment().format('YYYY-MM-DD-hh-mm-ss')}.json`
  ExporterUtil.saveAs(content, fileName)
}

export const mapImagesDataToVGGObject = (
  imgData,
  canvasWidth,
  canvasHeight
) => {
  const polys: any = []
  width = imgData[0].width
  height = imgData[0].height
  left = Math.round(imgData[0].aCoords.tl.x)
  top = Math.round(imgData[0].aCoords.tl.y)
  widthRate = width / (canvasWidth - 2 * left)
  heightRate = height / (canvasHeight - 2 * top)
  imgData.map(item => {
    if (item.name === 'polygon') polys.push(item)
  })
  const fileData = mapImageDataToVGGFileData(polys)
  return fileData
}

export const mapImageDataToVGGFileData = polys => {
  const regionsData = mapImageDataToVGG(polys)
  if (!regionsData) return null
  const size = picList.find(item => item.name === filename).size
  return {
    fileref: '',
    size,
    filename,
    base64_img_data: '',
    file_attributes: {},
    regions: regionsData,
  }
}

export const mapImageDataToVGG = polys => {
  if (polys.length === 0) return null
  const data: any = {}
  polys.map((item, index) => {
    const labelName = item.labelName
    if (!!labelName) {
      data[index.toString()] = {
        shape_attributes: mapPolygonToVGG(item.points),
        region_attributes: {
          label: labelName,
        },
      }
    }
  })
  return data
}
export const mapPolygonToVGG = polyData => {
  const points = polyData.filter((item, index, polyData) => {
    return polyData.indexOf(item, 0) === index
  })
  let firstX = 0
  let firstY = 0
  if (points.length === 0) return null
  const all_points_x: number[] = points
    .map((point, index) => {
      const x = calculatePoint(point.x, left, widthRate, width)
      if (index === 0) firstX = x
      return x
    })
    .concat(firstX)
  const all_points_y: number[] = points
    .map((point, index) => {
      const y = calculatePoint(point.y, top, heightRate, height)
      if (index === 0) firstY = y
      return y
    })
    .concat(firstY)
  return {
    name: 'polygon',
    all_points_x,
    all_points_y,
  }
}