import '@/config/elementConfig'
import '@/config/ivewConfig'
import 'assets/icons/iconfont'
import 'assets/icons/iconfont.css'
import 'scss/main'
import SUI from 'sx-sui-design'
import Vue from 'vue'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import App from './App.vue'
import router from './router'

Vue.use(SUI)
Vue.use(VueVirtualScroller)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
