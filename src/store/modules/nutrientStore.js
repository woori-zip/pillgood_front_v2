import axios from '../../axios'; // 설정된 axios 인스턴스 불러오기

const state = {
  nutrientEfficiencies: [],
  nutrients: []
};

const mutations = {
  setNutrientEfficiencies(state, nutrientEfficiencies) {
    state.nutrientEfficiencies = nutrientEfficiencies;
  },
  setNutrients(state, nutrients) {
    state.nutrients = nutrients;
  },
  removeNutrientEfficiency(state, id) {
    state.nutrientEfficiencies = state.nutrientEfficiencies.filter(ne => ne.nutrientEfficiencyId !== id);
  },
  addNutrientEfficiency(state, nutrientEfficiency) {
    state.nutrientEfficiencies.push(nutrientEfficiency);
  }
};

const actions = {
  async fetchNutrientEfficiencies({ commit }) {
    try {
      const response = await axios.get('/api/nutrientefficiencies/list');
      if (response.status === 200) {
        commit('setNutrientEfficiencies', response.data);
      } else {
        throw new Error('Failed to fetch nutrient efficiencies');
      }
    } catch (error) {
      console.error('Error fetching nutrient efficiencies:', error);
    }
  },
  async createNutrientEfficiency({ commit }, nutrientEfficiency) {
    try {
      const response = await axios.post('/admin/nutrientefficiencies/create', nutrientEfficiency);
      console.lot('영양제 생성 서버 응답:', response)
      if (response.status === 200) {
        commit('addNutrientEfficiency', response.data);
      } else {
        throw new Error('Failed to create nutrient efficiency');
      }
    } catch (error) {
      console.error('Error creating nutrient efficiency:', error);
      throw error;
    }
  },
  async createNutrient({ commit }, nutrient) {
    try {
      const response = await axios.post('/admin/nutrients/create', nutrient);
      if (response.status === 200) {
        commit('addNutrient', response.data);
        return response.data; // Return the newly created nutrient data
      } else {
        throw new Error('Failed to create nutrient');
      }
    } catch (error) {
      console.error('Error creating nutrient:', error);
      throw error;
    }
  },
  async fetchNutrients({ commit }) {
    try {
      const response = await axios.get('/api/nutrients/list');
      if (response.status === 200) {
        commit('setNutrients', response.data);
      } else {
        throw new Error('Failed to fetch nutrients');
      }
    } catch (error) {
      console.error('Error fetching nutrients:', error);
    }
  },  async deleteNutrientEfficiency({ commit }, id) {
    try {
      const response = await axios.delete(`/admin/nutrientefficiencies/delete/${id}`);
      if (response.status === 200) {
        commit('removeNutrientEfficiency', id);
      }
    } catch (error) {
      console.error('Nutrient efficiency delete error:', error);
      throw error;
    }
  }
};

const getters = {
  nutrientEfficiencies: state => state.nutrientEfficiencies,
  nutrients: state => state.nutrients
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
