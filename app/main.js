import Vue from 'nativescript-vue'
// import RadListView from 'nativescript-ui-listview/vue';
import App from './components/App'
import store from './store';

import VueDevtools from 'nativescript-vue-devtools'
import localStorage from 'nativescript-localstorage';

Vue.registerElement('RadCalendar', () => require('nativescript-ui-calendar').RadCalendar)
// Vue.registerElement('RadListView', () => require('nativescript-ui-listview').RadListView)

if(TNS_ENV !== 'production') {
  Vue.use(VueDevtools)
}
// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

var qs = require('qs');


new Vue({
  store,
  render: h => h('frame', [h(App)])
}).$start()
