import { v4 as uuidv4 } from 'uuid'
import { deserialize } from './ImportHelper'
import { getRandomColor } from './tools'

let fileList = [] as Array<any>

export const saveFileList = list => {
  fileList = list
}

export const bbox2rect = bbox => {
  return {
    x: bbox[0],
    y: bbox[1],
    width: bbox[2],
    height: bbox[3],
  }
}

export const arrange = (items, idArrangement: string[]): ImageData[] => {
  return items.sort((a, b) => {
    return idArrangement.indexOf(a.id) - idArrangement.indexOf(b.id)
  })
}

export const loadFileList = file => {
  return new Promise(
    (resolve: (value: any) => void, reject: (value: any) => void) => {
      const reader = new FileReader()
      reader.readAsText(file)

      let imagesData = [] as any
      let labelNames = [] as any

      reader.onloadend = (evt: any) => {
        const annotationsObject = deserialize(evt.target.result)
        const { images, categories, annotations } = annotationsObject
        // todo
        // console.log('annotationsObject', annotationsObject)
        //!引入的注解文件包含的图片名称
        const imageNames: string[] = images.map(i => i.file_name)

        const inputImagesData = Array.prototype.map.call(
          fileList,
          (file: File) => {
            return {
              id: uuidv4(),
              fileData: file,
              loadStatus: false,
              labelRects: [],
              labelPoints: [],
              labelLines: [],
              labelPolygons: [],
              labelNameIds: [],
              isVisitedByObjectDetector: false,
              isVisitedByPoseDetector: false,
            }
          },
        )

        //!对目前存在的图片进行分类 pass-包含在注解文件中  fail-不包含
        const imageDataPartition = { pass: [], fail: [] } as Record<string, any>
        inputImagesData.forEach((item: any) => {
          if (imageNames.includes(item.fileData.name)) {
            imageDataPartition.pass.push(item)
          } else {
            imageDataPartition.fail.push(item)
          }
        })

        // todo
        // console.log('imageDataPartition', imageDataPartition)

        const labelNameMap = {} as Record<string, any>
        categories.map(categorie => {
          labelNameMap[categorie.id] = {
            id: uuidv4(),
            name: categorie.name,
            color: getRandomColor(),
          }
        })

        // todo
        // console.log('labelNameMap', labelNameMap)
        //map
        const imageDataMap = {} as Record<string, any>
        images.forEach(image => {
          const { id, file_name } = image
          const passItem = imageDataPartition.pass.find(
            img => img.fileData.name === file_name,
          )
          if (passItem) {
            imageDataMap[id] = passItem
          }
        })

        // todo
        // console.log('imageDataMap', imageDataMap)

        for (const annotation of annotations) {
          //   // todo
          //   console.log('annotation', annotation)
          if (!imageDataMap[annotation.image_id] || annotation.iscrowd === 1)
            continue
          //   if (this.labelType.includes(LabelType.RECT)) {
          imageDataMap[annotation.image_id].labelRects.push({
            id: uuidv4(),
            labelId: labelNameMap[annotation.category_id].id,
            rect: bbox2rect(annotation.bbox),
            isCreatedByAI: false,
            status: 'ACCEPTED',
            suggestedLabel: null,
          })
          //   }
          // if (this.labelType.includes(LabelType.POLYGON)) {
          //   const polygons = COCOUtils.segmentation2vertices(
          //     annotation.segmentation,
          //   )
          //   for (const polygon of polygons) {
          //     imageDataMap[annotation.image_id].labelPolygons.push(
          //       LabelUtil.createLabelPolygon(
          //         labelNameMap[annotation.category_id].id,
          //         polygon,
          //       ),
          //     )
          //   }
          // }
        }

        const resultImageData = Object.values(imageDataMap).concat(
          imageDataPartition.fail,
        )

        imagesData = arrange(
          resultImageData,
          inputImagesData.map((item: any) => item.id),
        )
        labelNames = Object.values(labelNameMap)

        // todo
        console.log('imagesData', imagesData)

        // todo
        console.log('labelNames', labelNames)

        if (
          imagesData.length === resultImageData.length &&
          labelNames.length === categories.length
        ) {
          resolve({
            imagesData,
            labelNames,
          })
        }
      }
    },
  )
}