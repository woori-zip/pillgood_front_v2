import axios from '../../axios';

const state = {
  billingKey: null
};

const mutations = {
  setBillingKey(state, billingKey) {
    state.billingKey = billingKey;
  }
};

const actions = {
  async fetchBillingKey({ commit }) {
    try {
      const response = await axios.get('/api/payment/billing-key', { withCredentials: true });
      if (response.data) {
        commit('setBillingKey', response.data);
      } else {
        console.log('Billing key not found');
      }
    } catch (error) {
      console.error('Error fetching billing key:', error);
    }
  },
  async issueBillingKey({ commit }, billingRequest) {
    try {
      const response = await axios.post('/api/payment/issue-billing-key', billingRequest, { withCredentials: true });
      if (response.status === 200 && response.data.billingKey) {
        commit('setBillingKey', response.data.billingKey);
      } else {
        console.error('Billing key issuance failed');
      }
    } catch (error) {
      console.error('Error issuing billing key:', error);
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};