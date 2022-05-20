export enum LabelType {
  IMAGE_RECOGNITION = 'IMAGE RECOGNITION',
  POINT = 'POINT',
  RECT = 'RECT',
  POLYGON = 'POLYGON',
  LINE = 'LINE',
}

export interface IPoint {
  x: number
  y: number
}

export interface IRect {
  x: number
  y: number
  height: number
  width: number
}

export enum LabelStatus {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  UNDECIDED = 'UNDECIDED',
}

export interface ILine {
  start: IPoint
  end: IPoint
}

export type LabelRect = {
  // GENERAL
  id: string
  labelId: string
  rect: IRect

  // AI
  isCreatedByAI: boolean
  status: LabelStatus
  suggestedLabel: string
}

export type LabelPoint = {
  // GENERAL
  id: string
  labelId: string
  point: IPoint

  // AI
  isCreatedByAI: boolean
  status: LabelStatus
  suggestedLabel: string
}

export type LabelPolygon = {
  id: string
  labelId: string
  vertices: IPoint[]
}

export type LabelLine = {
  id: string
  labelId: string
  line: ILine
}

export type LabelName = {
  name: string
  id: string
  color: string
}

export type ImageData = {
  id: string
  fileData: File
  loadStatus: boolean
  labelRects: LabelRect[]
  labelPoints: LabelPoint[]
  labelLines: LabelLine[]
  labelPolygons: LabelPolygon[]
  labelNameIds: string[]

  // SSD
  isVisitedByObjectDetector: boolean

  // POSE NET
  isVisitedByPoseDetector: boolean
}

export type COCOSegmentation = number[][]
export type COCOBBox = [number, number, number, number]

export type COCOInfo = {
  description: string
}

export type COCOImage = {
  id: number
  width: number
  height: number
  file_name: string
}

export type COCOCategory = {
  id: number
  name: string
}

export type COCOAnnotation = {
  id: number
  category_id: number
  iscrowd: number
  segmentation: COCOSegmentation
  image_id: number
  area: number
  bbox: COCOBBox
}

export type COCOObject = {
  info: COCOInfo
  images: COCOImage[]
  annotations: COCOAnnotation[]
  categories: COCOCategory[]
}
