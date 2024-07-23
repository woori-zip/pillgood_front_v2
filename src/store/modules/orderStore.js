import axios from '../../axios'; // 설정된 axios 인스턴스 불러오기

const state = {
  orderDetails: [],
  currentOrder: null, // 현재 주문 정보 추가
  userProfile: null,
  coupons: []
};

const mutations = {
  setOrderDetails(state, orderDetails) {
    state.orderDetails = orderDetails;
  },
  setCurrentOrder(state, order) { // 현재 주문 정보 설정
    state.currentOrder = order;
  },
  setUserProfile(state, userProfile) {
    state.userProfile = userProfile;
  },
  setCoupons(state, coupons) {
    state.coupons = coupons;
  },
  updateOrderItemImage(state, { productId, productImage }) {
    const item = state.orderDetails.find(item => item.productId === productId);
    if (item) {
      item.productImage = productImage;
    }
  }
};

const actions = {
  async fetchUserProfile({ commit }) {
    try {
      const response = await axios.get('/api/members/mypage', { withCredentials: true });
      if (response.status === 200) {
        commit('setUserProfile', response.data);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  },
  async fetchCoupons({ commit }) {
    try {
      const response = await axios.get('/api/ownedcoupons/findbyid', { withCredentials: true });
      if (response.status === 200) {
        commit('setCoupons', response.data);
      } else {
        console.error('Failed to fetch coupons');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  },
  async fetchOrderDetails({ commit, dispatch }) {
    try {
      const response = await axios.get('/api/orders/prepare', { withCredentials: true });
      if (response.status === 200) {
        commit('setOrderDetails', response.data);
        
        // 각 제품의 이미지를 가져오는 작업 수행
        for (const item of response.data) {
          dispatch('fetchProductImage', item);
        }
      } else {
        console.error('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  },
  async fetchProductImage({ commit }, item) {
    try {
      const response = await axios.get(`/api/products/detail/${item.productId}`);
      const productImage = extractFirstImage(response.data.productImage);
      commit('updateOrderItemImage', { productId: item.productId, productImage });
    } catch (error) {
      console.error(`Error fetching image for product ID ${item.productId}:`, error);
    }
  },
  async placeOrder({ commit }, orderDetails) {
    try {
      const response = await axios.post('/api/orders/create', orderDetails, { withCredentials: true });
      commit('setCurrentOrder', response.data); // 현재 주문 정보 설정
      return response;
    } catch (error) {
      console.error('주문 에러: ', error);
      throw error;
    }
  }
};

function extractFirstImage(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const imgTag = doc.querySelector('img');
  return imgTag ? imgTag.src : null;
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
