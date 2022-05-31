import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { calculatePoint, calculatePolyOffset } from './ExporterUtil'
import { SegmentationImg, SegmentationData } from './SegmentationImg'

let filename = ''
let widthRate = 0
let heightRate = 0
let width = 0
let height = 0
let left = 0
let top = 0
let picList = [] as any
export const exportVGG = (data, pics, changedPic, rate) => {
  picList = pics
  const zip = new JSZip()
  const segImgs = SegmentationImg(rate, changedPic)
  const segKeys = Object.keys(segImgs)
  segKeys.map(key => {
    if (segImgs[key].length > 0) {
      const segData = SegmentationData(data, segImgs[key])
      const keys = Object.keys(segData)
      let jsonData: any = {}
      keys.forEach(item => {
        filename = item
        const fileData = mapImagesDataToVGGObject(segData[item])
        jsonData[filename] = fileData
      })
      const content = JSON.stringify(jsonData)
      try {
        zip.file(`${key}.json`, content)
        const folder: any = zip.folder(key)
        segImgs[key].map(pic => {
          folder.file(pic.name, pic.url.substring(22), { base64: true })
        })
      } catch (error) {
        // TODO
        throw new Error(error as string)
      }
    }
  })
  try {
    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
      saveAs(content, `VGG-${moment().format('YYYY-MM-DD-hh-mm-ss')}.zip`)
    })
  } catch (error) {
    // TODO
    throw new Error(error as string)
  }
}

export const mapImagesDataToVGGObject = imgData => {
  const polys: any = []
  width = imgData[0].width
  height = imgData[0].height
  left = Math.round(imgData[0].left)
  top = Math.round(imgData[0].top)
  const canvasWidth = imgData[0].curWidth
  const canvasHeight = imgData[0].curHeight
  widthRate = width / canvasWidth
  heightRate = height / canvasHeight
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
    const pointsObj = item.hasOwnProperty('controls')
      ? item.oCoords
      : item.points
    const points = calculatePolyOffset(pointsObj, item.left, item.top)
    if (!!labelName) {
      data[index.toString()] = {
        shape_attributes: mapPolygonToVGG(points),
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
