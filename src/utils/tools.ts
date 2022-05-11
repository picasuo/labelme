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
