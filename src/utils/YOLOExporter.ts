import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { calculatePoint } from './ExporterUtil'
import { wrapImageIntoVOC } from './VOCXMLExporter'

let width = 0
let height = 0
let left = 0
let top = 0
let widthRate = 0
let heightRate = 0

export const exportYOLO = (data, canvasWidth, canvasHeight) => {
  let keys: any = Object.keys(data)
  const zip = new JSZip()
  keys.forEach(item => {
    const fileContent = wrapRectLabelsIntoYOLO(data, canvasWidth, canvasHeight)
    if (fileContent) {
      const fileName: string = item.replace(/\.[^/.]+$/, '.xml')
      try {
        zip.file(fileName, fileContent)
      } catch (error) {
        // TODO
        throw new Error(error as string)
      }
    }
  })
  try {
    zip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, `数据集-${moment().format('YYYY-MM-DD-hh-mm-ss')}.zip`)
    })
  } catch (error) {
    // TODO
    throw new Error(error as string)
  }
}

export const wrapRectLabelsIntoYOLO = (imgData, canvasWidth, canvasHeight) => {
  const rects: any = []
  width = imgData[0].width
  height = imgData[0].height
  left = Math.round(imgData[0].aCoords.tl.x)
  top = Math.round(imgData[0].aCoords.tl.y)
  widthRate = width / (canvasWidth - 2 * left)
  heightRate = height / (canvasHeight - 2 * top)
  imgData.map(item => {
    if (item.name === 'rectangle') rects.push(item)
  })
  const labels = rects.map(rect => {
    return wrapRectLabelIntoYOLO(rect)
  })
  return labels
}

export const wrapRectLabelIntoYOLO = data => {}
