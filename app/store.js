import Vue from 'vue';
import Vuex from 'vuex';
import * as calendarModule from 'nativescript-ui-calendar';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    notes: []
  },
  mutations: {
    addNote (state, event) {
      console.log('commit')
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
