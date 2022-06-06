import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { calculatePoint, calculatePolyOffset } from './ExporterUtil'
import { SegmentationData, SegmentationImg } from './SegmentationImg'

let widthRate = 0
let heightRate = 0
let width = 0
let height = 0
let left = 0
let top = 0
let labels = [] as any
export const exportCOCO = (data, labelList, changedPic, rate) => {
  const zip = new JSZip()
  labels = labelList
  const segImgs = SegmentationImg(rate, changedPic)
  const segKeys = Object.keys(segImgs)
  segKeys.map(key => {
    if (segImgs[key].length > 0) {
      const segData = SegmentationData(data, segImgs[key])
      const jsonData = mapImagesDataToCOCOObject(segData)
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
      saveAs(content, `COCO-${moment().format('YYYY-MM-DD-hh-mm-ss')}.zip`)
    })
  } catch (error) {
    // TODO
    throw new Error(error as string)
  }
}
export const mapImagesDataToCOCOObject = data => {
  return {
    info: getInfoComponent(''),
    images: getImagesComponent(data),
    annotations: getAnnotationsComponent(data),
    categories: getCategoriesComponent(labels),
  }
}
export const getInfoComponent = description => {
  return {
    description: description,
  }
}
export const getImagesComponent = data => {
  let keys: any = Object.keys(data)
  const images = [] as any
  keys.forEach((item, index) => {
    images.push({
      id: index + 1,
      width: data[item][0].width,
      height: data[item][0].height,
      file_name: item,
    })
  })
  return images
}
export const getCategoriesComponent = labelArr => {
  return labelArr.map((item, index) => {
    return {
      id: index + 1,
      name: item.name,
    }
  })
}
export const getAnnotationsComponent = data => {
  // todo
  console.log('data', data)

  let id = 0
  const annotations = [] as any
  let keys: any = Object.keys(data)
  keys.map((item, index) => {
    width = data[item][0].width
    height = data[item][0].height
    //图片的相对位置
    left = Math.round(data[item][0].left)
    top = Math.round(data[item][0].top)
    const canvasWidth = data[item][0].curWidth
    const canvasHeight = data[item][0].curHeight
    widthRate = width / canvasWidth
    heightRate = height / canvasHeight
    const rects: any = []
    const polys: any = []
    data[item].map(v => {
      // 区分矩形、多边形
      if (v.name === 'rectangle') rects.push(v)
      if (v.name === 'polygon') polys.push(v)
    })
    if (rects.length > 0) {
      rects.map(v => {
        const points = [
          { x: v.aCoords.tl.x, y: v.aCoords.tl.y },
          { x: v.aCoords.tr.x, y: v.aCoords.tr.y },
          { x: v.aCoords.bl.x, y: v.aCoords.bl.y },
          { x: v.aCoords.br.x, y: v.aCoords.br.y },
        ] as any
        annotations.push({
          id: id++,
          iscrowd: 0,
          image_id: index + 1,
          category_id: labels.findIndex(el => el.name === v.labelName) + 1,
          segmentation: [],
          bbox: getCOCOBbox(points),
          area: getCOCOArea(points),
        })
      })
    }
    if (polys.length > 0) {
      // todo
      console.log('polys', polys)

      polys.map(v => {
        const pointsObj = v.hasOwnProperty('controls') ? v.oCoords : v.points
        const points = calculatePolyOffset(pointsObj, v.left, v.top)
        annotations.push({
          id: id++,
          iscrowd: 0,
          image_id: index + 1,
          category_id: labels.findIndex(el => el.name === v.labelName) + 1,
          segmentation: getCOCOSegmentation(points),
          bbox: getCOCOBbox(points),
          area: getCOCOArea(points),
        })
      })
    }
  })
  return annotations
}

export const getCOCOSegmentation = points => {
  const pointArr = points.map(point => {
    const x = calculatePoint(point.x, left, widthRate, width)
    const y = calculatePoint(point.y, top, heightRate, height)
    return [x, y]
  })
  return [_.flatten(pointArr)]
}

export const getCOCOBbox = points => {
  let xmin = points[0].x
  let xmax = points[0].x
  let ymin = points[0].y
  let ymax = points[0].y
  points.map(point => {
    if (xmin > point.x) xmin = point.x
    if (xmax < point.x) xmax = point.x
    if (ymin > point.y) ymin = point.y
    if (ymax < point.y) ymax = point.y
  })
  xmin = calculatePoint(xmin, left, widthRate, width)
  xmax = calculatePoint(xmax, left, widthRate, width)
  ymin = calculatePoint(ymin, top, heightRate, height)
  ymax = calculatePoint(ymax, top, heightRate, height)
  return [xmin, ymin, xmax - xmin, ymax - ymin]
}

export const getCOCOArea = points => {
  let area = 0
  let j = points.length - 1
  for (let i = 0; i < points.length; i++) {
    const jx = calculatePoint(points[j].x, left, widthRate, width)
    const ix = calculatePoint(points[i].x, left, widthRate, width)
    const jy = calculatePoint(points[j].y, top, heightRate, height)
    const iy = calculatePoint(points[i].y, top, heightRate, height)
    area += (jx + ix) * (jy - iy)
    j = i
  }
  return Math.abs(area / 2)
}
