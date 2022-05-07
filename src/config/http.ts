import axios, { AxiosRequestConfig } from 'axios'
import { HTTP_URL, IMAGE_URL } from 'config/config'
// import router from 'router/index'
import { RequestResult } from 'ts/type'

const axiosInstance = axios.create({
  baseURL: HTTP_URL,
})

axiosInstance.interceptors.request.use(
  config => {
    config.headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'Admin-Token': '',
    }
    // 删除headers中key值为空(falsy)的header
    for (let prop in config.headers) {
      if (!config.headers[prop]) {
        delete config.headers[prop]
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  response => {
    checkStatus({ response })
    return response.data
  },
  error => checkStatus(error)
)

function checkStatus({ response }) {
  let error_msg = '网络异常'
  if (response) {
    const { status, data } = response
    switch (status) {
      case 200:
        if (data.error_code === 401) {
          //   session.clear()
          //   session.SET_JUMPING(false)
          //   router.replace('/login')
          //   error_msg = '登录已失效,请重新登录'
        }

        break
      case 401:
        // if (response.data.error_code === 401) {
        // }
        break
      case 304:
        // 304 不会返回数据 这里 data 为空(要设计 304 缓存数据)
        return data
      case 402:
        // 权限错误 重新登录
        // error_msg = '登录已失效,请重新登录'
        break
      default:
        error_msg = data.error_msg || '网络异常'
        break
    }
    // return Promise.reject({ status: response.status || 404, error_msg })
  }
  //   return Promise.reject({ status: 404, error_msg })
}

// 请求基础配置
const baseConfig: AxiosRequestConfig = {
  timeout: 4000000,
}

/**
 * 由于 axios 拦截器直接对 Resp 进行解析操作, 直接返回结果数据格式
 * 因此请求接口返回类型不再是 Promise<AxiosResponse<T>>
 * 而是自定义的 Promise<RequestResult<T>>
 * 目前只能强制类型转化
 */
export default {
  get<T, V = null>(url, params?, config?: AxiosRequestConfig) {
    return axiosInstance.get<T>(url, {
      params,
      ...baseConfig,
      ...config,
    }) as any as Promise<RequestResult<T, V>>
  },
  post<T, V = null>(url, data?, config?: AxiosRequestConfig) {
    return axiosInstance.post<T>(url, data, {
      ...baseConfig,
      ...config,
    }) as any as Promise<RequestResult<T, V>>
  },
  put<T, V = null>(url, data?, config?: AxiosRequestConfig) {
    return axiosInstance.put<T>(url, data, {
      ...baseConfig,
      ...config,
    }) as any as Promise<RequestResult<T, V>>
  },
  delete<T, V = null>(url, data?, config?: AxiosRequestConfig) {
    return axiosInstance.delete<T>(url, {
      data,
      ...baseConfig,
      ...config,
    }) as any as Promise<RequestResult<T, V>>
  },
}

/**
 * 获取图片地址 (图片空间)
 * @param val 图片名称
 * @param size 图片大小
 * @param noCache 是否取消缓存
 */
export const getImgSrc = (val: string, size = '', noCache = false): string =>
  `${IMAGE_URL}/image/${val}` +
  (size ? `?size=${size}` : '') +
  (noCache ? `${size ? '&' : '?'}timeStamp=${Date.now()}` : '')
