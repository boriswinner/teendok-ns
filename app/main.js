import Vue from 'nativescript-vue'
// import RadListView from 'nativescript-ui-listview/vue';
import App from './components/App'
import store from './store';

import VueDevtools from 'nativescript-vue-devtools'
import localStorage from 'nativescript-localstorage';
import LoginPage from './components/LoginPage'

Vue.registerElement('RadCalendar', () => require('nativescript-ui-calendar').RadCalendar)
// Vue.registerElement('RadListView', () => require('nativescript-ui-listview').RadListView)

Vue.registerElement(
  'CheckBox',
  () => require('nativescript-checkbox').CheckBox,
  {
    model: {
      prop: 'checked',
      event: 'checkedChange'
    }
  }
);

Vue.registerElement("Mapbox", () => require("nativescript-mapbox").MapboxView)

if(TNS_ENV !== 'production') {
  Vue.use(VueDevtools)
}
// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

var qs = require('qs');

var firebase = require("nativescript-plugin-firebase");
firebase
  .init({
    // Optionally pass in properties for database, authentication and cloud messaging,
    // see their respective docs.
  })
  .then(
    function(instance) {
      console.log("firebase.init done");
    },
    function(error) {
      console.log("firebase.init error: " + error);
    }
  );
  
new Vue({
  store,
  render: h => h('frame', [h(LoginPage)])
}).$start()
