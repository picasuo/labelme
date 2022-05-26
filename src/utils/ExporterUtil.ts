import { saveAs } from 'file-saver'

export class ExporterUtil {
  public static saveAs(content: string, fileName: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    try {
      saveAs(blob, fileName)
    } catch (error) {
      // TODO: Implement file save error handling
      throw new Error(error as string)
    }
  }
}

export const calculatePoint = (point, offset, rate, normal) => {
  let p = Math.round((point - offset) * rate)

  //偏移超过图片范围，不显示
  if (p < 0) {
    p = 0
  }
  if (p > normal) {
    p = normal
  }
  return p
}

export const imgShuffle = arr => {
  let currentIndex = arr.length,
    randomIndex
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex],
    ]
  }
  return arr
}
