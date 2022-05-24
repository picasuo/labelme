import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { calculatePoint } from './ExporterUtil'

let width = 0
let height = 0
let left = 0
let top = 0
let widthRate = 0
let heightRate = 0

export const exportVOC = data => {
  let keys: any = Object.keys(data)
  const zip = new JSZip()
  keys.forEach(item => {
    const fileContent = wrapImageIntoVOC(data[item], item)
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

export const wrapImageIntoVOC = (imgData, filename) => {
  const rects: any = []
  width = imgData[0].width
  height = imgData[0].height
  left = Math.round(imgData[0].left)
  top = Math.round(imgData[0].top)
  const canvasWidth = imgData[0].canvas.width
  const canvasHeight = imgData[0].canvas.height
  widthRate = width / canvasWidth
  heightRate = height / canvasHeight
  imgData.map(item => {
    if (item.name === 'rectangle') rects.push(item)
  })
  const labels = wrapRectLabelsIntoVOC(rects)
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

export const wrapRectLabelsIntoVOC = imgData => {
  if (imgData.length === 0) return null
  const labelRectString = imgData.map(item => {
    const labelName = item.labelName
    const xmin = calculatePoint(item.aCoords.tl.x, left, widthRate, width)
    const xmax = calculatePoint(item.aCoords.br.x, left, widthRate, width)
    const ymin = calculatePoint(item.aCoords.tr.y, top, heightRate, height)
    const ymax = calculatePoint(item.aCoords.bl.y, top, heightRate, height)
    const labelFields = !!labelName
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
          `\t</object>`,
        ]
      : []
    return labelFields.join('\n')
  })
  return labelRectString.join('\n')
}
