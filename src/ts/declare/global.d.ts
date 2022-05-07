import { LoDashStatic } from 'lodash'

declare global {
  const _: LoDashStatic
  const moment: typeof import('moment')
}

declare module 'vue/types/vue' {
  interface Vue {
    $bus: Vue
    $SxMessage: any
    $ISpin: any
    $SxLoading: any
  }
}
