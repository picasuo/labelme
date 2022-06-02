const yaml = require('js-yaml')
import { v4 as uuidv4 } from 'uuid'
import { Colors } from './tools'
let yamlResult = {} as Record<string, any>
const imagesData = [] as Array<any>

export const loadYoloFile = () => {
  // todo
  console.log('imagesdata', imagesData)

  let labelNames = [] as Array<any>
  if (yamlResult.names) {
    labelNames = yamlResult.names.map(name => {
      return {
        name,
        id: uuidv4(),
        color: Colors.random(),
      }
    })
  } else {
    let fuckIndex = 0

    imagesData.forEach(item => {
      const { labelRects } = item
      labelRects.forEach((i, index) => {
        const labInx = labelNames.findIndex(
          label => label.labelIndex === i.labelIndex,
        )
        if (labInx === -1) {
          labelNames.push({
            name: (++fuckIndex).toString(),
            id: uuidv4(),
            color: Colors.random(),
            labelIndex: i.labelIndex,
          })
        }
      })
    })

    // // todo
    // console.log('labelNames', labelNames)
  }

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

  const obj = {
    labelNames,
    isYolo: true,
  }

  if (list.length > 0) {
    obj['imagesData'] = list
  }

  //   // todo
  //   console.log('obj', obj)
  return obj
}

export const loadYamlFile = file => {
  return new Promise(
    (
      resolve: (value: Record<string, any>) => void,
      reject: (value: any) => void,
    ) => {
      const { type, name } = file

      if (type) {
        const reader = new FileReader()
        reader.readAsText(file)

        reader.onload = (evt: any) => {
          yamlResult = yaml.load(evt.target.result)
          const labelNames = yamlResult.names.map(name => {
            return {
              name,
              id: uuidv4(),
              color: Colors.random(),
            }
          })
          //   loadYoloFile()

          const obj = {
            labelNames,
            isYolo: true,
          } as any

          resolve(obj)
        }
      }
    },
  )
}

export const loadTxtFile = fileList => {
  return new Promise(
    (
      resolve: (value: Record<string, any>) => void,
      reject: (value: any) => void,
    ) => {
      Array.prototype.forEach.call(fileList, (file: File, index) => {
        const { type, name } = file

        if (type) {
          const reader = new FileReader()
          reader.readAsText(file)

          reader.onload = (evt: any) => {
            const keyName = name.split('.')[0]
            //   rectData[keyName] = evt.target.result.split(' ')
            const labelRects = [] as Array<any>

            evt.target.result.split('\n').forEach(item => {
              const itemData = item.split(' ').map(i => Number(i))

              labelRects.push({
                labelIndex: itemData[0],
                bbox: itemData.slice(1),
              })
            })
            imagesData.push({
              imgName: keyName,
              labelRects,
            })

            if (imagesData.length === fileList.length) {
              const obj = loadYoloFile() as any

              resolve(obj)
            }
          }
        }
      })
    },
  )
}
