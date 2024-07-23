import axios from 'axios';

const state = {
  subscriptions: [],
  loading: false,
  error: null,
};

const mutations = {
  setSubscriptions(state, subscriptions) {
    state.subscriptions = subscriptions;
  },
  setLoading(state, loading) {
    state.loading = loading;
  },
  setError(state, error) {
    state.error = error;
  },
};

const actions = {
  async fetchSubscriptions({ commit }, memberId) {
    commit('setLoading', true);
    commit('setError', null);
    try {
      const response = await axios.get(`/api/subscriptions/member/${memberId}`, { withCredentials: true });
      commit('setSubscriptions', response.data);
    } catch (error) {
      commit('setError', error.response ? error.response.data : 'Error fetching subscriptions');
    } finally {
      commit('setLoading', false);
    }
  },
};

const getters = {
  subscriptions: state => state.subscriptions,
  loading: state => state.loading,
  error: state => state.error,
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
