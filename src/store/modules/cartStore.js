import axios from '../../axios'; // 설정된 axios 인스턴스 불러오기

const state = {
  cartItems: [] // 장바구니 항목을 저장할 상태
};

const mutations = {
  setCartItems(state, cartItems) {
    state.cartItems = cartItems;
  },
  updateCartItemQuantity(state, { cartNo, productQuantity }) {
    const item = state.cartItems.find(item => item.cartNo === cartNo);
    if (item) {
      item.productQuantity = productQuantity;
    }
  }
};

const actions = {
  async fetchCartItems({ commit }) {
    try {
      const response = await axios.get('/api/carts/findbyid', { withCredentials: true });
      commit('setCartItems', response.data);
    } catch (error) {
      console.error('장바구니 항목 불러오기 에러: ', error);
    }
  },
  async updateCartItem({ commit }, item) {
    try {
      await axios.put(`/api/carts/update/${item.cartNo}`, {
        ...item
      });
      commit('updateCartItemQuantity', { cartNo: item.cartNo, productQuantity: item.productQuantity });
    } catch (error) {
      console.error('장바구니 항목 업데이트 에러: ', error);
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
