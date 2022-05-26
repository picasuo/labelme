import { v4 as uuidv4 } from 'uuid'
import { Colors } from './tools'

const yaml = require('js-yaml')

export const loadYoloFile = fileList => {
  return new Promise(
    (
      resolve: (value: Record<string, any>) => void,
      reject: (value: any) => void,
    ) => {
      let yamlResult = {} as Record<string, any>
      const imagesData = [] as Array<any>
      Array.prototype.forEach.call(fileList, (file: File, index) => {
        const { type, name } = file
        if (type) {
          const reader = new FileReader()
          reader.readAsText(file)
          if (type === 'application/x-yaml') {
            reader.onloadend = (evt: any) => {
              yamlResult = yaml.load(evt.target.result)
            }
          }
          if (type === 'text/plain') {
            reader.onload = (evt: any) => {
              const keyName = name.split('.')[0]
              //   rectData[keyName] = evt.target.result.split(' ')
              const labelRects = [] as Array<any>

              evt.target.result.split('\n').forEach(item => {
                const itemData = item.split(' ')
                labelRects.push({
                  labelIndex: Number(itemData[0]),
                  bbox: itemData.slice(1),
                })
              })
              imagesData.push({
                imgName: keyName,
                labelRects,
              })

              if (imagesData.length === fileList.length - 3) {
                setTimeout(() => {
                  //   // todo
                  //   console.log('imagesdata', imagesData)

                  const { names = [] as Array<any> } = yamlResult
                  const labelNames = names.map(name => {
                    return {
                      name,
                      id: uuidv4(),
                      color: Colors.random(),
                    }
                  })
                  let list = [] as Array<any>

                  imagesData.forEach(image => {
                    let { imgName, labelRects } = image
                    const rectList = [] as Array<any>
                    labelRects.forEach(rect => {
                      const { labelIndex, bbox } = rect

                      rectList.push({
                        labelId: labelNames[labelIndex].id,
                        bbox,
                      })
                    })

                    list.push({
                      imgName,
                      labelRects: rectList,
                      loadStatus: false,
                    })
                  })
                  resolve({ labelNames, imagesData: list, isYolo: true })
                }, 1000)
              }
            }
          }
        }
      })
    },
  )
}
