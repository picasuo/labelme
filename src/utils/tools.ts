import { file } from 'jszip'

//处理字符串显示长度
export const handleStringLength = (string, length) => {
  return string.length > length ? `${string.slice(0, length)}...` : string
}

//处理图片名字显示长度
export const handlePicName = (string, length) => {
  const strArr = string.split('.')
  let frontName =
    strArr[0].length > length ? `${strArr[0].slice(0, length)}...` : strArr[0]

  return `${frontName}.${strArr[1]}`
}

//对象数组去重复
export const unique = (arr, key) => {
  if (!arr) return arr
  if (key === undefined) return [...new Set(arr)]
  const map = {
    string: e => e[key],
    function: e => key(e),
  }
  const fn = map[typeof key]
  const obj = arr.reduce((o, e) => ((o[fn(e)] = e), o), {})
  return Object.values(obj)
}

export const Colors = {} as Record<string, any>

Colors.names = {
  aqua: '#00ffff',
  black: '#000000',
  //   blue: '#0000ff',
  brown: '#a52a2a',
  //   cyan: '#00ffff',
  darkblue: '#00008b',
  darkcyan: '#008b8b',
  darkgrey: '#a9a9a9',
  darkgreen: '#006400',
  darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f',
  darkorange: '#ff8c00',
  darkorchid: '#9932cc',
  darkred: '#8b0000',
  darksalmon: '#e9967a',
  darkviolet: '#9400d3',
  //   fuchsia: '#ff00ff',
  gold: '#ffd700',
  green: '#008000',
  indigo: '#4b0082',
  khaki: '#f0e68c',
  lime: '#00ff00',
  //   magenta: '#ff00ff',
  maroon: '#800000',
  navy: '#000080',
  olive: '#808000',
  orange: '#ffa500',
  pink: '#ffc0cb',
  purple: '#800080',
  //   violet: '#800080',
  red: '#ff0000',
  silver: '#c0c0c0',
}

Colors.random = function () {
  let result
  let count = 0

  //   const randomNum = Math.random()
  if (Object.keys(this.names).length === 0) {
    alert('别玩颜色了！就这么点都给你用完了！')
    throw new Error('别玩颜色了！就这么点都给你用完了！')
    return
  }

  const firstName = Object.keys(this.names)[0]
  result = this.names[firstName]
  delete this.names[firstName]

  return result
}

//随机生成颜色
export const getRandomColor = () => {
  const r = Math.floor(Math.random() * 255)
  const g = Math.floor(Math.random() * 255)
  const b = Math.floor(Math.random() * 255)
  return 'rgba(' + r + ',' + g + ',' + b + ',0.4)'
}

export const getPicResolution = url => {
  const img = new Image()
  img.src = url
  img.onload = () => {
    return `${img.width}*${img.height}`
  }
}

export const shortCuts =
  'backspace,command+z,command+shift+z,p,r,a,d,0,1,2,3,4,5,6,7,8,9'

export const getPic = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader() as any
    reader.readAsDataURL(file)
    reader.onload = () => {
      const img = new Image()
      img.src = reader.result
      // 获取图片宽高
      img.onload = function () {
        resolve({
          name: file.name,
          url: reader.result,
          format: `${img.width}*${img.height}`,
        })
      }
    }
  })
}
