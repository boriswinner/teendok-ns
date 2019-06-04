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
      event.id = state.notes.length
      state.notes = state.notes.concat([event])
    },
    editNote (state, event) {
      console.log('edit')
      state.notes[event.id] = event
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
