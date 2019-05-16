import Vue from 'vue';
import Vuex from 'vuex';
import * as calendarModule from 'nativescript-ui-calendar';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    notes: []
  },
  mutations: {
    addNote (state, payload) {
      console.log('commit')
      let now = new Date();
      let startDate;
      let endDate;      
      startDate = new Date(now.getFullYear(), now.getMonth(), 1 * 2, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), (1 * 2), 3);      
      let event = new calendarModule.CalendarEvent("as", startDate, endDate)
      console.log(event)
      state.notes.push(event)
    }
  },
  actions: {

  },
  getters: {
    getNotesByDate: state => date => {
      return state.notes[date]
    }
  }
});
