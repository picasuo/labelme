// import YAML from 'json2yaml'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { calculatePoint } from './ExporterUtil'
import { NumberUtil } from './NumberUtil'
import { SegmentationData, SegmentationImg } from './SegmentationImg'

let width = 0
let height = 0
let left = 0
let top = 0
let widthRate = 0
let heightRate = 0
let labels

export const exportYOLO = (data, labelList, changedPic, rate) => {
  labels = labelList
  const zip = new JSZip()
  const segImgs = SegmentationImg(rate, changedPic)
  const segKeys = Object.keys(segImgs)
  segKeys.map(item => {
    if (segImgs[item].length > 0) {
      const segData = SegmentationData(data, segImgs[item])
      const keys = Object.keys(segData)
      const folder: any = zip.folder(item)
      const labels = folder.folder('labels')
      const images = folder.folder('images')
      keys.forEach(key => {
        const fileContent: string = wrapRectLabelsIntoYOLO(segData[key])
        if (fileContent) {
          const fileName: string = key.replace(/\.[^/.]+$/, '.txt')
          try {
            labels.file(fileName, fileContent)
            segImgs[item].map(pic => {
              images.file(pic.name, pic.url.substring(22), { base64: true })
            })
          } catch (error) {
            // TODO
            throw new Error(error as string)
          }
        }
      })
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
      saveAs(content, `YOLO-${moment().format('YYYY-MM-DD-hh-mm-ss')}.zip`)
    })
  } catch (error) {
    // TODO
    throw new Error(error as string)
  }
}

export const wrapLabels = data => {
  let labels: any = {
    train: '../train/images',
    val: '../valid/images',
    test: '../test/images',
    nc: data.length,
  }
  let names = '['
  data.map(item => {
    names = names + `'${item.name}',`
  })
  // 替换最后一个字符,改为]
  names = names.replace(/.$/, ']')
  const yml = [
    `train: ${labels.train}`,
    `val: ${labels.val}`,
    `test: ${labels.test}`,
    `nc: ${labels.nc}`,
    `names: ${names}`,
  ]
  return yml.join('\n')
}

export const wrapRectLabelsIntoYOLO = imgData => {
  const allData: any = []
  width = imgData[0].width
  height = imgData[0].height
  left = Math.round(imgData[0].left)
  top = Math.round(imgData[0].top)
  const canvasWidth = imgData[0].curWidth
  const canvasHeight = imgData[0].curHeight
  widthRate = width / canvasWidth
  heightRate = height / canvasHeight
  imgData.map(item => {
    if (item.name !== 'img') allData.push(item)
  })
  const labels = allData.map(rect => {
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
    //!中心点在框中的位置
    rectCenter.x / width,
    rectCenter.y / height,
    //!框/图片
    rectSize.width / width,
    rectSize.height / height,
  ]
  let [x, y, rwidth, rheight] = rawBBox.map((value: number) =>
    parseFloat(snapAndFix(value)),
  )
  const processedBBox = [x, y, rwidth, rheight].map((value: number) =>
    snapAndFix(value),
  )
  return [classIdx, ...processedBBox].join(' ')
}

export const getCenter = rect => {
  const x =
    (calculatePoint(rect.aCoords.tr.x, left, widthRate, width) +
      calculatePoint(rect.aCoords.tl.x, left, widthRate, width)) /
    2
  const y =
    (calculatePoint(rect.aCoords.bl.y, top, heightRate, height) +
      calculatePoint(rect.aCoords.tr.y, top, heightRate, height)) /
    2
  return {
    x,
    y,
  }
}
export const getSize = rect => {
  return {
    width:
      calculatePoint(rect.aCoords.tr.x, left, widthRate, width) -
      calculatePoint(rect.aCoords.tl.x, left, widthRate, width),
    height:
      calculatePoint(rect.aCoords.bl.y, top, heightRate, height) -
      calculatePoint(rect.aCoords.tr.y, top, heightRate, height),
  }
}
