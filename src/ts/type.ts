/* ts 类型声明 */
export interface RequestResult<T, V> {
  code: number
  error_msg: string
  data?: T
  extra_data?: V
}

export interface Page {
  page: number
  page_size: number
  total: number
}

// 账户信息
export interface UserInfo {
  id: number
  group_id: number
  address: string
  address_code: string
  agreement_time: []
  auth_token: string
  create_time: number
  last_login: number
  name: string
  nickname: string
  token: string
  update_time: number
  username: string
  setname: string
  setbrand: number
}
export interface ShopItem {
  setname: string
  setbrand: number
}

// 楼层配置信息
export interface FloorData {
  id: number
  building_id: number
  block_num: number
  coordinate: number[][][]
  err_points: number[]
  name: string
  plan: string
  size: number[]
}

export interface AreaData {
  id: number
  floor_id: number
  name: string
  coordinate: string
  mold: number
  in_cameras: []
  near_cameras: []
  out_cameras: []
}

export interface CameraData {
  id: number
  floor_id: number
  area_id: []
  coordinate: string
  enable: boolean
  latest_time: null
  mac: string
  mall_id: number
  mold: []
  name: string
  status: number
}

export interface BrandData {
  in_cameras: any
  out_cameras: any
  near_cameras: any
  id: number
  business_id: null
  name: string
  floor_id: number
}

export interface FlowEntity {
  entity_id: number
  name: string
  in_set: any[]
  in_used: number
  near_set: any[]
  near_used: number
  out_set: any[]
  out_used: number
  page: number
}
