import axios from '../../axios'; // 설정된 axios 인스턴스 불러오기

const state = {
  efficiencies: []
};

const mutations = {
  setEfficiencies(state, efficiencies) {
    state.efficiencies = efficiencies;
  }
};

const actions = {
  async fetchEfficiencies({ commit }) {
    try {
      const response = await axios.get('/api/efficiencies/list');
      if (response.status === 200) {
        commit('setEfficiencies', response.data);
      } else {
        throw new Error('Efficiencies fetch failed');
      }
    } catch (error) {
      console.error('Error fetching efficiencies:', error);
      throw error;
    }
  }
};

const getters = {
  efficiencies: state => state.efficiencies
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
