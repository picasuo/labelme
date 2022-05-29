import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { SegmentationImg, SegmentationData } from './SegmentationImg'

export const exportImgJson = (data, changedPic, rate) => {
  const zip = new JSZip()
  const segImgs = SegmentationImg(rate, changedPic)
  const segKeys = Object.keys(segImgs)
  segKeys.map(item => {
    if (segImgs[item].length > 0) {
      const segData = SegmentationData(data, segImgs[item])
      const keys: any = Object.keys(data)
      const contentObject = keys.map(item => {
        const labelData = segData[item]
        const labels = [] as any
        labelData.map(v => {
          labels.push(v.name)
        })
        return {
          image: item,
          annotations: labels,
        }
      })
      const content = JSON.stringify(contentObject)
      try {
        zip.file(`${item}.json`, content)
        const folder: any = zip.folder(item)
        segImgs[item].map(pic => {
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
      saveAs(content, `IMG-${moment().format('YYYY-MM-DD-hh-mm-ss')}.zip`)
    })
  } catch (error) {
    // TODO
    throw new Error(error as string)
  }
}
