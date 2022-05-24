const yaml = require('js-yaml')

const readeFileList = fileList => {
  return new Promise(
    (
      resolve: (value: Record<string, any>) => void,
      reject: (value: any) => void,
    ) => {
      let yamlResult = {} as Record<string, any>
      let imagesData = [] as Array<any>
      Array.prototype.forEach.call(fileList, (file: File, index) => {
        const { type, name } = file
        if (type) {
          if (type === 'application/x-yaml') {
            const reader = new FileReader()
            reader.readAsText(file)
            reader.onload = (evt: any) => {
              yamlResult = yaml.load(evt.target.result)
            }
          }
          if (type === 'text/plain') {
            const reader = new FileReader()
            reader.readAsText(file)
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
                loadStatus: false,
              })

              if (imagesData.length === fileList.length - 3) {
                // todo
                console.log('imagesData', imagesData)
                resolve({ yamlResult, imagesData })
              }
            }
          }
        }
      })
    },
  )
}

export const loadYoloFile = fileList => {
  readeFileList(fileList).then(val => {
    const { imagesData, yamlResult } = val

    // const { names = [] as Array<any> } = yamlResult
    // const labelNames = names.map(name => {
    //   return {
    //     name,
    //     id: uuidv4(),
    //     color: getRandomColor(),
    //   }
    // })
    // let list = [] as Array<any>
    // // todo
    // console.log('imagesData', imagesData)
    // imagesData.forEach(image => {
    //   let { imgName, labelRects } = image
    //   const rectList = [] as Array<any>
    //   labelRects.forEach(rect => {
    //     const { labelIndex, bbox } = rect
    //     // todo
    //     console.log('labelNames', labelNames, labelIndex)

    //     rectList.push({
    //       labelId: labelNames[labelIndex]['id'],
    //       bbox,
    //     })
    //   })

    //   list.push({
    //     imgName,
    //     labelRects,
    //   })
    // })

    // // todo
    // console.log('list', list)

    // // todo
    // console.log('labelNames', labelNames)
  })
}
