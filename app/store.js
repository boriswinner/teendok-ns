import Vue from 'vue';
import Vuex from 'vuex';
import * as calendarModule from 'nativescript-ui-calendar';
import * as ApplicationSettings from "application-settings";
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


export default new Vuex.Store({
  state: {
    notes: []
  },
  mutations: {
    addNote (state, event) {
      console.log('commit')
      event.id = state.notes.length
      event["idstr"] = (event.noteText + event.startDate.toString() + event.endDate.toString()).toString().replace(/[^A-Z0-9]/ig, "")   
      state.notes = state.notes.concat([event])
      for (let i = 0; i < state.notes.length; ++i){
        for (var property in state.notes[i]) {
          console.log( property + ': ' + state.notes[i][property]+'; ')
        }                    
      }      
    },
    editNote (state, event) {
      event["idstr"] = (event.noteText + event.startDate.toString() + event.endDate.toString()).toString().replace(/[^A-Z0-9]/ig, "") 
      state.notes[event.id] = event
    },
    editNoteByIdstr (state, event) {
      console.log('!!!!')
      console.log(event.idstr)
      console.log('-----')
      for (let i = 0; i < state.notes.length; ++i){
        for (var property in state.notes[i]) {
          console.log( property + ': ' + state.notes[i][property]+'; ')
        }                    
      }
      console.log('----')
      let id  = state.notes.filter(
        function findByIdString (note){
          console.log('note:')
          console.log(note.idstr)
          console.log('event:')
          console.log(event.idstr)
          return note.idstr === event.idstr
        })
      'id:'
      console.log(id)
      console.log(id[0].id)
      event["idstr"] = (event.noteText + event.startDate.toString() + event.endDate.toString()).toString().replace(/[^A-Z0-9]/ig, "") 
      event.id = id[0].id
      state.notes[id[0].id] = event    
      state.notes = state.notes.concat('a')
      state.notes.pop()
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