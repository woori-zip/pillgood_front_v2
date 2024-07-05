import axios from '../../axios'; // 설정된 axios 인스턴스 불러오기

const state = {
  deficiencies: [],
  deficiencyNutrients: []
};

const mutations = {
  setDeficiencies(state, deficiencies) {
    state.deficiencies = deficiencies;
  },
  setDeficiencyNutrients(state, deficiencyNutrients) {
    state.deficiencyNutrients = deficiencyNutrients;
  }
};

const actions = {
  async fetchDeficiencies({ commit }) {
    try {
      const response = await axios.get('/api/deficiencies/list');
      if (response.status === 200) {
        commit('setDeficiencies', response.data);
      } else {
        throw new Error('Deficiencies fetch failed');
      }
    } catch (error) {
      console.error('Error fetching deficiencies:', error);
      throw error;
    }
  },
  async fetchDeficiencyNutrients({ commit }) {
    try {
      const response = await axios.get('/api/deficiency-nutrients/list');
      if (response.status === 200) {
        commit('setDeficiencyNutrients', response.data);
      } else {
        throw new Error('Deficiency Nutrients fetch failed');
      }
    } catch (error) {
      console.error('Error fetching deficiency nutrients:', error);
      throw error;
    }
  }
};

const getters = {
  deficiencies: state => state.deficiencies,
  deficiencyNutrients: state => state.deficiencyNutrients
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
