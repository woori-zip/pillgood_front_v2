// reviewStore.js
import axios from '../../axios';
import store from '../index'; 

const state = {
  reviews: [],
};

const mutations = {
  addReview(state, review) {
    state.reviews.push(review);
  },
};

const actions = {
  async createReview({ commit }, reviewData) {
    try {
      // Vuex 스토어에서 memberId를 가져옵니다.
      const memberId = store.state.member.memberId;
      console.log('memberId:', memberId); // memberId 출력

      // reviewData에 memberId를 추가합니다.
      const reviewPayload = {
        ...reviewData,
        memberId,
      };

      console.log('Sending review data:', reviewPayload); // 리뷰 데이터를 서버로 보내기 전에 출력

      const response = await axios.post('/api/reviews/create', reviewPayload, {
        withCredentials: true, // 세션 쿠키를 포함하여 요청을 보냅니다.
      });

      commit('addReview', response.data);
      console.log('Review created successfully:', response.data);
    } catch (error) {
      console.error('Failed to create review:', error);
      throw error;
    }
  },
};

const getters = {
  reviews: state => state.reviews,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
