import { imgShuffle } from './ExporterUtil'

export const SegmentationImg = (rate, imgs) => {
  const shuffleImgs = imgShuffle(imgs)
  const train = shuffleImgs.slice(0, rate.train)
  const valid = shuffleImgs.slice(rate.train, rate.train + rate.valid)
  const test = shuffleImgs.slice(rate.train + rate.valid)
  return { train, valid, test }
}

export const SegmentationData = (data, imgs) => {
  const names = [] as any
  imgs.map(item => {
    names.push(item.name)
  })
  const deepData = _.cloneDeep(data)
  const keys = Object.keys(deepData)
  keys.map(key => {
    if (!names.includes(key)) {
      delete deepData[key]
    }
  })
  return deepData
}
