import { ExporterUtil } from './ExporterUtil'
export const exportImgJson = data => {
  let keys: any = Object.keys(data)
  const contentObject = keys
    .filter(item => {
      const imgData = data[item][0]
      return imgData.labelName && imgData.labelName.length > 0
    })
    .map(item => {
      const imgData = data[item][0]
      return {
        image: item,
        annotations: imgData.labelName,
      }
    })
  const content = JSON.stringify(contentObject)
  const fileName = `数据集-${moment().format('YYYY-MM-DD-hh-mm-ss')}.json`
  ExporterUtil.saveAs(content, fileName)
}
