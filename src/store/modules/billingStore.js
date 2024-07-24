import axios from '../../axios';

const state = {
  billingKey: null,
  billingAmount: null,
  paymentInfo: null
};

const mutations = {
  setBillingKey(state, billingKey) {
    state.billingKey = billingKey;
  },
  setBillingAmount(state, amount) {
    state.billingAmount = amount;
  },
  setPaymentInfo(state, paymentInfo) {
    state.paymentInfo = paymentInfo;
  }
};

const actions = {
  async fetchBillingKey({ commit }, memberId) {
    try {
      console.log('Fetching billing key for memberId:', memberId); // 로그 추가
      const response = await axios.get(`/api/payment/billing-key/${memberId}`);
      if (response.status === 200 && response.data) {
        commit('setBillingKey', response.data);
        console.log('Fetched billing key:', response.data); // 로그 추가
        return response.data;
      } else {
        console.error('결제 키를 가져오는 중 오류 발생:', response);
      }
    } catch (error) {
      console.error('결제 키를 가져오는 중 오류 발생:', error);
    }
  },
  async fetchPaymentInfo({ commit }, orderNo) {
    try {
      console.log('Fetching payment info for orderNo:', orderNo); // 로그 추가
      const response = await axios.get(`/api/payment/payment-info/${orderNo}`);
      if (response.status === 200 && response.data) {
        commit('setPaymentInfo', response.data);
        commit('setBillingAmount', response.data.amount); // 결제 금액 설정
        console.log('Fetched payment info:', response.data); // 로그 추가
        return response.data.amount;
      } else {
        console.error('결제 정보를 가져오는 중 오류 발생:', response);
      }
    } catch (error) {
      console.error('결제 정보를 가져오는 중 오류 발생:', error);
    }
  },
  async deleteBillingKey({ commit }, memberId) {
    try {
      console.log('Deleting billing key for memberId:', memberId); // 로그 추가
      const response = await axios.delete(`/api/payment/delete-billing-key/${memberId}`);
      if (response.status === 204) {
        commit('setBillingKey', null);
        commit('setBillingAmount', null);
        console.log('Deleted billing key successfully');
        return true;
      } else {
        console.error('빌링 키 삭제 중 오류 발생:', response);
        return false;
      }
    } catch (error) {
      console.error('빌링 키 삭제 중 오류 발생:', error);
      return false;
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
