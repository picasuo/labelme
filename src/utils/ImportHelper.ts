import { v4 as uuidv4 } from 'uuid'
import { COCOObject, ImageData } from './type_interface'

export const deserialize = (text: string): COCOObject => {
  try {
    return JSON.parse(text) as COCOObject
  } catch (error) {
    throw 'COCO annotation file need to be in JSON format'
  }
}

export const createImageDataFromFileData = (fileData: File): ImageData => {
  return {
    id: uuidv4(),
    fileData,
    loadStatus: false,
    labelRects: [],
    labelPoints: [],
    labelLines: [],
    labelPolygons: [],
    labelNameIds: [],
    isVisitedByObjectDetector: false,
    isVisitedByPoseDetector: false,
  }
}
