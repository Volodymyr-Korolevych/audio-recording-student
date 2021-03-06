import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false
export const eventBus = new Vue(); // creating an event bus

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
