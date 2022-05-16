let widthRate = 0
let heightRate = 0
let width = 0
let height = 0
let left = 0
let top = 0
let canvasWidth = 0
let canvasHeight = 0
let labels = [] as any
export const exportCOCO = (data, labelList, canvasW, canvasH) => {
  canvasWidth = canvasW
  canvasHeight = canvasH
  labels = labelList
  const content = mapImagesDataToCOCOObject(data)
  console.log(content)
}
export const mapImagesDataToCOCOObject = data => {
  return {
    info: getInfoComponent(''),
    images: getImagesComponent(data),
    annotations: getAnnotationsComponent(data),
    categories: getCategoriesComponent(data),
  }
}
export const getInfoComponent = description => {
  return {
    description: description,
  }
}
export const getImagesComponent = data => {
  let keys: any = Object.keys(data)
  keys = keys.slice(1)
  const images = [] as any
  keys.forEach((item, index) => {
    images.push({
      id: index + 1,
      width: data[item][0].width,
      height: data[item][0].height,
      file_name: item,
    })
  })
  return images
}
export const getCategoriesComponent = data => {
  let keys: any = Object.keys(data)
  keys = keys.slice(1)
  console.log(data)
}
export const getAnnotationsComponent = data => {
  let id = 0
  const annotations = data
}
