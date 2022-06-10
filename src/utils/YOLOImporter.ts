const yaml = require('js-yaml')
import { v4 as uuidv4 } from 'uuid'
import { Colors } from './tools'
let yamlResult = {} as Record<string, any>
const imagesData = [] as Array<any>
let labelNames = [] as Array<any>

let imagesNum = 0
export const loadYoloFile = () => {
  if (yamlResult.names) {
    yamlResult.names.map((name, index) => {
      const labelIndex = labelNames.findIndex(o => o.labelIndex === index)
      if (labelIndex !== -1) {
        labelNames[labelIndex].name = name
      } else {
        labelNames.push({
          name,
          id: uuidv4(),
          color: Colors.random(),
        })
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
      isYolo: true,
    })
  })

  const obj = {
    labelNames,
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
          yamlResult.names.map((name, index) => {
            const labelIndex = labelNames.findIndex(o => o.labelIndex === index)
            if (labelIndex !== -1) {
              labelNames[labelIndex].name = name
            } else {
              labelNames.push({
                name,
                id: uuidv4(),
                color: Colors.random(),
              })
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
      let fileNum = 0
      Array.prototype.forEach.call(fileList, (file: File, index) => {
        const { type, name } = file
        const keyName = name.slice(0, name.lastIndexOf('.'))

        if (!imagesData.find(image => image.imgName === keyName)) {
          fileNum++
          if (type) {
            const reader = new FileReader()
            reader.readAsText(file)

            reader.onload = (evt: any) => {
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

              if (imagesData.length === fileNum + imagesNum) {
                const obj = loadYoloFile() as any
                imagesNum = imagesData.length
                resolve(obj)
              }
            }
          }
        }
      })
    },
  )
}
