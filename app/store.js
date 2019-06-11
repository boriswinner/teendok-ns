import Vue from 'vue';
import Vuex from 'vuex';
import * as calendarModule from 'nativescript-ui-calendar';
import * as ApplicationSettings from "application-settings";
import localStorage from 'nativescript-localstorage';

Vue.use(Vuex);

const NSVuexPersistent = store => {
  // Init hook.
  let storageStr = localStorage.getItem('ns-vuex-persistent');
  console.log('-------')
  console.log(storageStr)
  if (storageStr) {
   store.replaceState(JSON.parse(storageStr))
   console.log(JSON.parse(storageStr))
   console.log('notes')
   console.log(store)
  }
  store.subscribe((mutation, state) => {
   // Suscribe hook.
   console.log('state stringify')
   console.log(JSON.stringify(state))
   localStorage.setItem('ns-vuex-persistent', JSON.stringify(state));
  })
 };


export default new Vuex.Store({
  state: {
    notes: []
  },
  mutations: {
    addNote (state, event) {
      console.log('commit')
      event.id = state.notes.length
      state.notes = state.notes.concat([event])
      console.log('state notes')
      console.log(state.notes)
    },
    editNote (state, event) {
      console.log('edit')
      console.log(event.noteText)
      state.notes[event.id] = event
    }
  },
  actions: {

  },
  getters: {
    getNotes: state => {
      let events = []
      state.notes.forEach(function callback(currentValue, index, array) {
        events.push(new calendarModule.CalendarEvent(currentValue.noteText, new Date(currentValue.startDate), new Date(currentValue.endDate), false))

      });
      return events
    },
    // getNotesByDate: state => date => {
    //   return state.notes[date]
    // }
  },
  plugins: [NSVuexPersistent]  
});