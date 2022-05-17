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
