import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
export function createRouter () {
  return new Router({
    routes: [
      { path: '/router1', component: () => import('../../components/router1.vue') },
      { path: '/router2', component: () => import('../../components/router2.vue') }
    ]
  })
}