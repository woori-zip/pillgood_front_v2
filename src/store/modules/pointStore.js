import axios from 'axios';

const state = {
  pointsList: [],
  totalPoints: 0,
  loading: false,
  error: null,
};

const getters = {
  pointsList: state => state.pointsList,
  totalPoints: state => state.totalPoints,
  loading: state => state.loading,
  error: state => state.error,
};

const actions = {
  async fetchPointsList({ commit }) {
    commit('setLoading', true);
    commit('setError', null);
    try {
      const response = await axios.get('/api/points/list', { withCredentials: true });
      commit('setPointsList', response.data);
    } catch (error) {
      commit('setError', error.response ? error.response.data : 'Error fetching points list');
    } finally {
      commit('setLoading', false);
    }
  },

  async fetchTotalPoints({ commit }) {
    commit('setLoading', true);
    commit('setError', null);
    try {
      const response = await axios.get('/api/points/totalPoints', { withCredentials: true });
      commit('setTotalPoints', response.data);
    } catch (error) {
      commit('setError', error.response ? error.response.data : 'Error fetching total points');
    } finally {
      commit('setLoading', false);
    }
  },
};

const mutations = {
  setPointsList(state, pointsList) {
    state.pointsList = pointsList;
  },
  setTotalPoints(state, totalPoints) {
    state.totalPoints = totalPoints;
  },
  setLoading(state, loading) {
    state.loading = loading;
  },
  setError(state, error) {
    state.error = error;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
