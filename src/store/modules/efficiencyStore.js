import axios from '../../axios'; // 설정된 axios 인스턴스 불러오기

const state = {
  efficiencies: []
};

const mutations = {
  setEfficiencies(state, efficiencies) {
    state.efficiencies = efficiencies;
  },
  addEfficiency(state, efficiency) {
    state.efficiencies.push(efficiency);
  },
  removeEfficiency(state, id) {
    state.efficiencies = state.efficiencies.filter(efficiency => efficiency.efficiencyId !== id);
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
  },
  async createEfficiency({ commit }, efficiency) {
    try {
      const response = await axios.post('/admin/efficiencies/create', efficiency);
      if (response.status === 200) {
        commit('addEfficiency', response.data);
      } else {
        throw new Error('Efficiency creation failed');
      }
    } catch (error) {
      console.error('Error creating efficiency:', error);
      throw error;
    }
  },
  async deleteEfficiency({ commit }, id) {
    try {
      const response = await axios.delete(`/admin/efficiencies/delete/${id}`);
      if (response.status === 200) {
        commit('removeEfficiency', id);
      } else {
        throw new Error('Efficiency deletion failed');
      }
    } catch (error) {
      console.error('Error deleting efficiency:', error);
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
