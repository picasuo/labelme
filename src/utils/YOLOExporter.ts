import JSZip from 'jszip'
import YAML from 'json2yaml'
import { saveAs } from 'file-saver'
import { calculatePoint } from './ExporterUtil'
import { NumberUtil } from './NumberUtil'

let width = 0
let height = 0
let left = 0
let top = 0
let widthRate = 0
let heightRate = 0
let labels

export const exportYOLO = (data, labelList, canvasWidth, canvasHeight) => {
  let keys: any = Object.keys(data)
  labels = labelList
  const zip = new JSZip()
  keys.forEach(item => {
    const fileContent: string = wrapRectLabelsIntoYOLO(
      data[item],
      canvasWidth,
      canvasHeight
    )
    if (fileContent) {
      const fileName: string = item.replace(/\.[^/.]+$/, '.txt')
      try {
        zip.file(fileName, fileContent)
      } catch (error) {
        // TODO
        throw new Error(error as string)
      }
    }
  })
  const lablesContent = wrapLabels(labelList)
  try {
    zip.file('data.yaml', lablesContent)
  } catch (error) {
    // TODO
    throw new Error(error as string)
  }
  try {
    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
      saveAs(content, `数据集-${moment().format('YYYY-MM-DD-hh-mm-ss')}.zip`)
    })
  } catch (error) {
    // TODO
    throw new Error(error as string)
  }
}

export const wrapLabels = data => {
  let labels: any = {
    nc: data.length,
    names: [],
  }
  data.map(item => {
    labels.names.push(item.name)
  })
  return YAML.stringify(labels)
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
  return labels.join('\n')
}

export const wrapRectLabelIntoYOLO = data => {
  const snapAndFix = (value: number) =>
    NumberUtil.snapValueToRange(value, 0, 1).toFixed(6)
  const classIdx = _.findIndex(labels, { name: data.labelName }).toString()
  const rectCenter = getCenter(data)
  const rectSize = getSize(data)
  const rawBBox: number[] = [
    rectCenter.x / width,
    rectCenter.y / height,
    rectSize.width / width,
    rectSize.height / height,
  ]
  let [x, y, rwidth, rheight] = rawBBox.map((value: number) =>
    parseFloat(snapAndFix(value))
  )
  if (x + rwidth / 2 > 1) {
    rwidth = 2 * (1 - x)
  }
  if (x - rwidth / 2 < 0) {
    rwidth = 2 * x
  }
  if (y + rheight / 2 > 1) {
    rheight = 2 * (1 - y)
  }
  if (y - rheight / 2 < 0) {
    rheight = 2 * y
  }
  const processedBBox = [x, y, rwidth, rheight].map((value: number) =>
    snapAndFix(value)
  )
  return [classIdx, ...processedBBox].join(' ')
}

export const getCenter = rect => {
  const x =
    calculatePoint(rect.left, left, widthRate, width) +
    calculatePoint(rect.width + 2, left, widthRate, width) / 2
  const y =
    calculatePoint(rect.top, top, heightRate, height) +
    calculatePoint(rect.height + 2, top, heightRate, height) / 2
  return {
    x,
    y,
  }
}
export const getSize = rect => {
  return {
    width: calculatePoint(rect.width + 2, left, widthRate, width),
    height: calculatePoint(rect.height + 2, top, heightRate, height),
  }
}
