import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    notes: {}
  },
  mutations: {
    addNote (state, payload) {
      if (Array.isArray(state.notes[payload.date])) {
        state.notes[payload.date].push(payload.note)
      } else {
        state.notes[payload.date] = [payload.note]
      }
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
