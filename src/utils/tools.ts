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

export const Colors = {} as Record<string, any>

Colors.names = {
  aqua: '#00ffff',
  azure: '#f0ffff',
  beige: '#f5f5dc',
  black: '#000000',
  blue: '#0000ff',
  brown: '#a52a2a',
  cyan: '#00ffff',
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
  fuchsia: '#ff00ff',
  gold: '#ffd700',
  green: '#008000',
  indigo: '#4b0082',
  khaki: '#f0e68c',
  lightblue: '#add8e6',
  lightcyan: '#e0ffff',
  lightgreen: '#90ee90',
  lightgrey: '#d3d3d3',
  lightpink: '#ffb6c1',
  lightyellow: '#ffffe0',
  lime: '#00ff00',
  magenta: '#ff00ff',
  maroon: '#800000',
  navy: '#000080',
  olive: '#808000',
  orange: '#ffa500',
  pink: '#ffc0cb',
  purple: '#800080',
  violet: '#800080',
  red: '#ff0000',
  silver: '#c0c0c0',
  white: '#ffffff',
  yellow: '#ffff00',
}

Colors.random = function () {
  var result
  var count = 0

  //   const randomNum = Math.random()
  if (Object.keys(this.names).length === 0) {
    alert('别玩颜色了！就这么点都给你用完了！')
    throw new Error('别玩颜色了！就这么点都给你用完了！')
    return
  }
  for (var prop in this.names) {
    if (Math.random() < 1 / ++count) {
      result = prop
      delete this.names[prop]
    }
  }

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

  return `${img.width}*${img.height}`
}

export const shortCuts =
  'backspace,command+z,command+shift+z,p,r,a,d,0,1,2,3,4,5,6,7,8,9'
