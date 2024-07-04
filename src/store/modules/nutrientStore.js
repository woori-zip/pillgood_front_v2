import axios from '../../axios'; // 설정된 axios 인스턴스 불러오기

const state = {
  nutrients: []
};

const mutations = {
  setNutrients(state, nutrients) {
    state.nutrients = nutrients;
  },
  addNutrient(state, nutrient) {
    state.nutrients.push(nutrient);
  }
};

const actions = {
  async fetchNutrients({ commit }) {
    try {
      const response = await axios.get('/api/nutrients/list'); 
      // console.log('영양소 API 응답:', response.data); // 응답 데이터 로그
      if (response.status === 200) {
        commit('setNutrients', response.data);
        // console.log('영양소 데이터 가져오기 성공:', response.data);
      } else {
        // console.error('영양소 데이터 가져오기 실패:', response.data);
        throw new Error('영양소 데이터 가져오기 실패');
      }
    } catch (error) {
      console.error('영양소 데이터 가져오기 에러:', error);
      throw error;
    }
  },
  async createNutrient({ commit }, nutrient) {
    try {
      const response = await axios.post('/admin/nutrients/create', nutrient);
      console.log('서버 응답:', response); // 서버 응답 로그 추가
      if (response.status === 200) {
        console.log('store 영양소 생성 성공 응답:', response.data); // 성공 응답 로그 추가
        commit('addNutrient', response.data);
        return response.data
      } else {
        console.error('store 영양소 생성 실패 응답:', response.data); // 오류 로그 추가
        throw new Error('store 영양소 생성 실패');
      }
    } catch (error) {
      console.error('store 영양소 생성 에러:', error);
      throw error;
    }
  }
};

const getters = {
  nutrients: state => state.nutrients
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
