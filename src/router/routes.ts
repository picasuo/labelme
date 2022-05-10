import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import Index from '../views/Index.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Index',
    component: Index,
  },
  //   {
  //     path: '/imagetool',
  //     name: 'ImageTool',
  //     component: () =>
  //       import(/* webpackChunkName: "imagetool" */ '../views/Index.vue'),
  //   },
]
export default routes
