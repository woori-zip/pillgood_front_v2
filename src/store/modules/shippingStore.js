import axios from '@/axios'; // 설정된 axios 인스턴스 불러오기

const state = {
  addresses: []
};

const mutations = {
  setAddresses(state, addresses) {
    state.addresses = addresses;
  },
  addAddress(state, address) {
    state.addresses.push(address);
  },
  updateAddress(state, updatedAddress) {
    const index = state.addresses.findIndex(address => address.shippingAddrId === updatedAddress.shippingAddrId);
    if (index !== -1) {
      state.addresses.splice(index, 1, updatedAddress);
    }
  },
  removeAddress(state, addressId) {
    state.addresses = state.addresses.filter(address => address.shippingAddrId !== addressId);
  }
};

const actions = {
  async fetchAddresses({ commit }) {
    try {
      const response = await axios.get('/api/shipping-addresses/findbyid', { withCredentials: true });
      commit('setAddresses', response.data);
    } catch (error) {
      console.error('배송지 목록을 가져오는 중 오류 발생:', error);
    }
  },
  async addAddress({ commit }, address) {
    try {
      const response = await axios.post('/api/shipping-addresses/create', address, { withCredentials: true });
      commit('addAddress', response.data);
    } catch (error) {
      console.error('배송지 추가 중 오류 발생:', error);
    }
  },
  async updateAddress({ commit }, address) {
    try {
      const response = await axios.put(`/api/shipping-addresses/update/${address.shippingAddrId}`, address);
      commit('updateAddress', response.data);
    } catch (error) {
      console.error('배송지 수정 중 오류 발생:', error);
    }
  },
  async removeAddress({ commit }, addressId) {
    try {
      await axios.delete(`/api/shipping-addresses/delete/${addressId}`, { withCredentials: true });
      commit('removeAddress', addressId);
    } catch (error) {
      console.error('배송지 삭제 중 오류 발생:', error);
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
