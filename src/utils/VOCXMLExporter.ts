import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { calculatePoint, calculatePolyOffset } from './ExporterUtil'
import { SegmentationImg, SegmentationData } from './SegmentationImg'

let width = 0
let height = 0
let left = 0
let top = 0
let widthRate = 0
let heightRate = 0

export const exportVOC = (data, changedPic, rate) => {
  const zip = new JSZip()
  const segImgs = SegmentationImg(rate, changedPic)
  const segKeys = Object.keys(segImgs)
  segKeys.map(item => {
    if (segImgs[item].length > 0) {
      const segData = SegmentationData(data, segImgs[item])
      const keys = Object.keys(segData)
      const folder: any = zip.folder(item)
      keys.forEach(key => {
        const fileContent = wrapImageIntoVOC(segData[key], key)
        if (fileContent) {
          const fileName: string = key.replace(/\.[^/.]+$/, '.xml')
          try {
            folder.file(fileName, fileContent)
            segImgs[item].map(pic => {
              folder.file(pic.name, pic.url.substring(22), { base64: true })
            })
          } catch (error) {
            // TODO
            throw new Error(error as string)
          }
        }
      })
    }
  })
  try {
    zip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, `VOC-${moment().format('YYYY-MM-DD-hh-mm-ss')}.zip`)
    })
  } catch (error) {
    // TODO
    throw new Error(error as string)
  }
}

export const wrapImageIntoVOC = (imgData, filename) => {
  width = imgData[0].width
  height = imgData[0].height
  left = Math.round(imgData[0].left)
  top = Math.round(imgData[0].top)
  const canvasWidth = imgData[0].curWidth
  const canvasHeight = imgData[0].curHeight
  widthRate = width / canvasWidth
  heightRate = height / canvasHeight
  const labelData = imgData.slice(1)
  const labels = wrapAllLabelsIntoVOC(labelData)
  if (labels) {
    return [
      `<annotation>`,
      `\t<folder></folder>`,
      `\t<filename>${filename}</filename>`,
      `\t<path>/${filename}</path>`,
      `\t<source>`,
      `\t\t<database>Unspecified</database>`,
      `\t</source>`,
      `\t<size>`,
      `\t\t<width>${width}</width>`,
      `\t\t<height>${height}</height>`,
      `\t\t<depth>3</depth>`,
      `\t</size>`,
      labels,
      `</annotation>`,
    ].join('\n')
  }
  return null
}

export const wrapAllLabelsIntoVOC = labelData => {
  if (labelData.length === 0) return null
  const labelRectString = labelData.map(item => {
    const labelName = item.labelName
    const xmin = calculatePoint(item.aCoords.tl.x, left, widthRate, width)
    const xmax = calculatePoint(item.aCoords.br.x, left, widthRate, width)
    const ymin = calculatePoint(item.aCoords.tl.y, top, heightRate, height)
    const ymax = calculatePoint(item.aCoords.br.y, top, heightRate, height)
    let polygons: any = ''
    if (item.name === 'polygon') polygons = wrapPolygonLabelsIntoVOC(item)
    const labelFields = !!labelName
      ? item.name === 'polygon'
        ? [
            `\t<object>`,
            `\t\t<name>${labelName}</name>`,
            `\t\t<pose>Unspecified</pose>`,
            `\t\t<truncated>0</truncated>`,
            `\t\t<difficult>0</difficult>`,
            `\t\t<bndbox>`,
            `\t\t\t<xmin>${Math.round(xmin)}</xmin>`,
            `\t\t\t<ymin>${Math.round(ymin)}</ymin>`,
            `\t\t\t<xmax>${Math.round(xmax)}</xmax>`,
            `\t\t\t<ymax>${Math.round(ymax)}</ymax>`,
            `\t\t</bndbox>`,
            `\t\t<polygon>`,
            polygons,
            `\t\t<polygon>`,
            `\t</object>`,
          ]
        : [
            `\t<object>`,
            `\t\t<name>${labelName}</name>`,
            `\t\t<pose>Unspecified</pose>`,
            `\t\t<truncated>0</truncated>`,
            `\t\t<difficult>0</difficult>`,
            `\t\t<bndbox>`,
            `\t\t\t<xmin>${Math.round(xmin)}</xmin>`,
            `\t\t\t<ymin>${Math.round(ymin)}</ymin>`,
            `\t\t\t<xmax>${Math.round(xmax)}</xmax>`,
            `\t\t\t<ymax>${Math.round(ymax)}</ymax>`,
            `\t\t</bndbox>`,
            `\t</object>`,
          ]
      : []
    return labelFields.join('\n')
  })
  return labelRectString.join('\n')
}

export const wrapPolygonLabelsIntoVOC = poly => {
  const pointsObj = poly.hasOwnProperty('controls') ? poly.oCoords : poly.points
  const points = calculatePolyOffset(pointsObj, poly.left, poly.top)
  const polyString = points.map((item, index) => {
    const polyFields = [
      `\t\t\t<x${index + 1}>${calculatePoint(
        item.x,
        left,
        widthRate,
        width
      )}</x${index + 1}>`,
      `\t\t\t<y${index + 1}>${calculatePoint(
        item.y,
        top,
        heightRate,
        height
      )}</y${index + 1}>`,
    ]
    return polyFields.join('\n')
  })
  return polyString.join('\n')
}
