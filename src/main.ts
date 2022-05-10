import '@/config/elementConfig'
import '@/config/ivewConfig'
import 'assets/icons/iconfont'
import 'assets/icons/iconfont.css'
import 'scss/main'
import SUI from 'sx-sui-design'
import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.use(SUI)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
