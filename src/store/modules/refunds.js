import axios from '../../axios'; // axios 모듈 경로 수정

const state = {
  refunds: [],
};

const getters = {
  refunds: state => state.refunds,
};

const actions = {
  async createRefund({ commit }, refundData) {
    try {
      const response = await axios.post('/api/refunds/create', refundData);
      if (response.status === 201) {
        commit('addRefund', response.data);
        console.log('환불 정보가 성공적으로 저장되었습니다:', response.data);
      } else {
        console.error('환불 정보 저장에 실패했습니다:', response.data);
      }
    } catch (error) {
      console.error('환불 정보 저장 중 오류가 발생했습니다:', error);
    }
  },
  async fetchRefunds({ commit }, orderNo) { // orderNo 파라미터 추가
    try {
      const response = await axios.get(`/api/refunds/order/${orderNo}`); // orderNo 사용
      commit('setRefunds', response.data);
    } catch (error) {
      console.error('환불 목록을 가져오는 중 오류가 발생했습니다:', error);
    }
  },
};

const mutations = {
  addRefund: (state, refund) => state.refunds.push(refund),
  setRefunds: (state, refunds) => state.refunds = refunds,
};

export default {
  state,
  getters,
  actions,
  mutations,
};
