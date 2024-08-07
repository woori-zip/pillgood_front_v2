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
  },
  clearCartItems(state) {
    state.cartItems = [];
  },
  addCartItem(state, cartItem) {
    state.cartItems.push(cartItem);
  }
};

const actions = {
  async fetchCartItems({ commit }) {
    try {
      const response = await axios.get('/api/carts/findbyid', { withCredentials: true });
      commit('setCartItems', response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('장바구니가 비어있습니다.');
        commit('clearCartItems'); // 장바구니 비워짐 상태로 설정
      } else {
        console.error('장바구니 항목 불러오기 에러: ', error);
      }
    }
  },
  async updateCartItem({ commit }, item) {
    try {
      await axios.put(`/api/carts/update/${item.cartNo}`, {
        ...item
      });
      commit('updateCartItemQuantity', { cartNo: item.cartNo, productQuantity: item.productQuantity });
    } catch (error) {
      console.error('장바구니 항목 업데이트 에러:', error);
    }
  },
  async deleteCartItem({ commit }, cartNo) {
    try {
      await axios.delete(`/api/carts/delete/${cartNo}`);
      commit('removeCartItem', cartNo);
    } catch (error) {
      console.error('장바구니 항목 삭제 에러:', error);
    }
  },
  async addToCart({ commit }, cartItem) {
    try {
      const response = await axios.post('/api/carts/create', cartItem, { withCredentials: true });
      if (response.status === 201) {
        commit('addCartItem', response.data);
        return response;
      } else {
        console.error('장바구니 추가 실패:', response);
        return response;
      }
    } catch (error) {
      console.error('장바구니 항목 추가 에러:', error);
      throw error;
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
