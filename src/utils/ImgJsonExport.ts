import { ExporterUtil } from './ExporterUtil'
export const exportImgJson = data => {
  let keys: any = Object.keys(data)
  const contentObject = keys.map(item => {
    const labelData = data[item]
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
  const fileName = `Img-${moment().format('YYYY-MM-DD-hh-mm-ss')}.json`
  ExporterUtil.saveAs(content, fileName)
}
