import Vue from 'nativescript-vue'
import App from './components/App'
import store from './store';

import VueDevtools from 'nativescript-vue-devtools'

Vue.registerElement('RadCalendar', () => require('nativescript-ui-calendar').RadCalendar)

if(TNS_ENV !== 'production') {
  Vue.use(VueDevtools)
}
// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')


new Vue({
  store,
  render: h => h('frame', [h(App)])
}).$start()
