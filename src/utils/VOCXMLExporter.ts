import JSZip from 'jszip'
import { saveAs } from 'file-saver'

let width = 0
let height = 0

export const exportVOC = (data, canvasWidth, canvasHeight) => {
  let keys: any = Object.keys(data)
  keys = keys.slice(1)
  const zip = new JSZip()
  keys.forEach(item => {
    const fileContent = wrapImageIntoVOC(
      data[item],
      item,
      canvasWidth,
      canvasHeight
    )
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

export const wrapImageIntoVOC = (
  imgData,
  filename,
  canvasWidth,
  canvasHeight
) => {
  const rects: any = []
  width = imgData[0].width
  height = imgData[0].height
  const left = Math.round(imgData[0].aCoords.tl.x)
  const top = Math.round(imgData[0].aCoords.tl.y)
  imgData.map(item => {
    if (item.name === 'rectangle') rects.push(item)
  })
  const labels = wrapRectLabelsIntoVOC(
    rects,
    left,
    top,
    width / canvasWidth,
    height / canvasHeight
  )
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

export const wrapRectLabelsIntoVOC = (
  imgData,
  left,
  top,
  widthRate,
  heightRate
) => {
  if (imgData.length === 0) return null
  const labelRectString = imgData.map(item => {
    const labelName = item.labelName
    const xmin =
      Math.round(item.aCoords.tl.x - left) >= 0
        ? Math.round((item.aCoords.tl.x - left) * widthRate)
        : 0
    const ymin =
      Math.round(item.aCoords.tr.y - top) >= 0
        ? Math.round((item.aCoords.tr.y - top) * heightRate)
        : 0
    let xmax = Math.round((item.aCoords.br.x - left) * widthRate)
    let ymax = Math.round((item.aCoords.bl.y - top) * heightRate)
    xmax = xmax > width ? width : xmax
    ymax = ymax > height ? height : ymax
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
