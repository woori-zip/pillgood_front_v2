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
  },
  addDeficiency(state, deficiency) {
    state.deficiencies.push(deficiency);
  },
  addDeficiencyNutrient(state, deficiencyNutrient) {
    state.deficiencyNutrients.push(deficiencyNutrient);
  },
  removeDeficiency(state, id) {
    state.deficiencies = state.deficiencies.filter(d => d.deficiencyId !== id);
  },
  removeDeficiencyNutrient(state, id) {
    state.deficiencyNutrients = state.deficiencyNutrients.filter(dn => dn.deficiencyNutrientId !== id);
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
  },
  async createDeficiency({ commit }, deficiency) {
    try {
      const response = await axios.post('/admin/deficiencies/create', deficiency);
      if (response.status === 200) {
        commit('addDeficiency', response.data);
      } else {
        throw new Error('Failed to create deficiency');
      }
    } catch (error) {
      console.error('Error creating deficiency:', error);
      throw error;
    }
  },
  async createDeficiencyNutrient({ commit }, deficiencyNutrient) {
    try {
      const response = await axios.post('/admin/deficiency-nutrients/create', deficiencyNutrient);
      if (response.status === 200) {
        commit('addDeficiencyNutrient', response.data);
      } else {
        throw new Error('Failed to create deficiency nutrient');
      }
    } catch (error) {
      console.error('Error creating deficiency nutrient:', error);
      throw error;
    }
  },
  async deleteDeficiency({ commit }, id) {
    try {
      const response = await axios.delete(`/admin/deficiencies/delete/${id}`);
      if (response.status === 200) {
        commit('removeDeficiency', id);
      } else {
        throw new Error('Failed to delete deficiency');
      }
    } catch (error) {
      console.error('Error deleting deficiency:', error);
      throw error;
    }
  },
  async deleteDeficiencyNutrient({ commit }, id) {
    try {
      const response = await axios.delete(`/admin/deficiency-nutrients/delete/${id}`);
      if (response.status === 200) {
        commit('removeDeficiencyNutrient', id);
      } else {
        throw new Error('Failed to delete deficiency nutrient');
      }
    } catch (error) {
      console.error('Error deleting deficiency nutrient:', error);
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