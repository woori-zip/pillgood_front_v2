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
  updateReview(state, updatedReview) {
    const index = state.reviews.findIndex(review => review.id === updatedReview.id);
    if (index !== -1) {
      state.reviews.splice(index, 1, updatedReview);
    }
  },
};

const actions = {
  async createReview({ commit }, reviewData) {
    try {
      const memberId = store.state.member.memberId;
      console.log('memberId:', memberId);

      const reviewPayload = {
        ...reviewData,
        memberId,
      };

      console.log('Sending review data:', reviewPayload);

      const response = await axios.post('/api/reviews/create', reviewPayload, {
        withCredentials: true,
      });

      commit('addReview', response.data);
      console.log('후기 등록이 성공적으로 완료되었습니다: ', response.data);
    } catch (error) {
      console.error('후기 등록에 실패했습니다: ', error);
      throw error;
    }
  },
  async updateReview({ commit }, reviewData) {
    try {
      const { reviewId, ...payload } = reviewData;
      console.log('Sending update request for reviewId:', reviewId); // 로그 추가
      console.log('Payload:', payload); // 로그 추가

      const response = await axios.put(`/api/reviews/update/${reviewId}`, payload, {
        withCredentials: true,
      });

      commit('updateReview', response.data);
      console.log('후기 수정이 성공적으로 완료되었습니다: ', response.data);
    } catch (error) {
      console.error('후기 수정에 실패했습니다: ', error);
      throw error;
    }
  }
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
