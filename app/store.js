import Vue from 'vue';
import Vuex from 'vuex';
import * as calendarModule from 'nativescript-ui-calendar';
import localStorage from 'nativescript-localstorage';

Vue.use(Vuex);

const NSVuexPersistent = store => {
  // Init hook.
  let storageStr = localStorage.getItem('ns-vuex-persistent');
  if (storageStr) {
   store.replaceState(JSON.parse(storageStr))
  }
  store.subscribe((mutation, state) => {
   // Suscribe hook.
   localStorage.setItem('ns-vuex-persistent', JSON.stringify(state));
  })
 };

 function dateWithoutTime (date){
    var d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;        
  }     


export default new Vuex.Store({
  state: {
    notes: [],
    firebaseToken: null,
    firebaseUID: null,
  },
  mutations: {
    setFirebaseToken (state, token) {
      state.firebaseToken = token
    },
    setFirebaseUID (state, uid) {
      state.firebaseUID = uid
    },    
    clearNotes (state) {
      state.notes = []
    },
    addNote (state, event) {
      console.log('commit')
      event.positionInArray = state.notes.length
      state.notes = state.notes.concat([event])
    },
    editNote (state, event) {
      state.notes[event.positionInArray] = event
    },
  },
  actions: {

  },
  getters: {
    getCalendarEvents: state => {
      let events = []
      state.notes.forEach(function callback(currentValue, index, array) {
        if (currentValue.endDate > currentValue.startDate){
          events.push(new calendarModule.CalendarEvent(currentValue.name, new Date(currentValue.startDate), new Date(currentValue.endDate), false))
        }
      });
      return events
    },
    getFullEvents: state => {
      return state.notes
    },    
    getFullEventsOfDay(state) {
      return day => {
        let events =  state.notes.filter(function (evt) {
          // adding + is a hack to compare dates, also we dont handle timezones
          return ((+dateWithoutTime(evt.startDate) <= +dateWithoutTime(day) &&
                   +dateWithoutTime(evt.endDate) >= +dateWithoutTime(day)))
        })
        events.sort((a,b) => (a.startDate > b.startDate) ? 1 : ((b.startDate > a.startDate) ? -1 : 0))      
        return events        
      }
    },
    getFirebaseToken: state => {
      return state.firebaseToken;
    },
    getFirebaseUID: state => {
      return state.firebaseUID
    },
    getAPIurl: state => {
      return 'http://planner.skillmasters.ga/api/v1/'
    }
    // getNotesByDate: state => date => {
    //   return state.notes[date]
    // }
  },
  plugins: [NSVuexPersistent]  
});