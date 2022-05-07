import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'scss/main'
import SUI from 'sx-sui-design'
import '@/config/ivewConfig'

Vue.use(SUI)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
