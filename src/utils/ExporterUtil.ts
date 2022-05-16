import moment from 'moment'
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
