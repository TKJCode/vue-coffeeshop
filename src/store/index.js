import Vue from 'vue'
import Vuex from 'vuex'

import { homeModule } from './homeStore/modules'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    homeModule,
  }
})
