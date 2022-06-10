/* 按需导入 element-ui 组件 (统一使用 El 开头) */
import { Button, Descriptions, DescriptionsItem } from 'element-ui'
import Vue from 'vue'

Vue.component('ElButton', Button)
Vue.component('ElDescriptions', Descriptions)
Vue.component('ElDescriptionsItem', DescriptionsItem)
