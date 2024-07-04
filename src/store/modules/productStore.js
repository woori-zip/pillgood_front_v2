import axios from '../../axios';

const state = {
  products: []
};

const mutations = {
  addProduct(state, product) {
    state.products.push(product);
  },
  setProducts(state, products) {
    state.products = products;
  },
  updateProductStatus(state, { productId, active }) {
    const product = state.products.find(product => product.productId === productId);
    if (product) {
      product.active = active;
    }
  }
};

const actions = {
  async createProduct({ commit }, product) {
    try {
      const response = await axios.post('/admin/products/create', product); // 서버 엔드포인트 URL을 사용하여 제품 생성
      if (response.status === 201) {
        commit('addProduct', response.data);
        console.log('제품 등록 성공:', response.data);
      } else {
        console.error('제품 등록 실패:', response.data);
        throw new Error('제품 등록 실패');
      }
    } catch (error) {
      console.error('제품 등록 에러:', error);
      throw error;
    }
  },
  async fetchProducts({ commit }) {
    try {
      const response = await axios.get('/products/list');
      console.log('제품리스트조회response',response)
      if (response.status === 200) {
        const products = Array.isArray(response.data) && Array.isArray(response.data[0]) ? response.data[0] : response.data;
        commit('setProducts', products);
      } else {
        throw new Error('제품 조회 실패');
      }
    } catch (error) {
      console.error('제품을 불러오는 데 실패했습니다. ', error);
      throw error;
    }
  },
  async updateProductStatus({ commit }, { productId, active }) {
    try {
      const response = await axios.put(`/admin/products/${productId}/status`, { active });
      // console.log('서버 응답:', response); // 서버 응답 로그 추가
      if (response && response.status === 200) {
        commit('updateProductStatus', { productId, active });
        return response; 
      } else {
        console.error('제품 상태 업데이트 실패:', response);
        throw new Error('제품 상태 업데이트 실패');
      }
    } catch (error) {
      console.error('제품 상태 업데이트 에러:', error);
      throw error;
    }
  },
    // 비동기 방식 : 두 개의 매개변수를 받는데, 첫번째 매개변수는 사용하지 않으므로 '_'로 표시
    async fetchProductDetails(_, productId) {
      try {
        // console.log(`Fetching product details for ID: ${productId}`);
        const response = await axios.get(`/products/detail/${productId}`); // 요청 URL
        // console.log('Response:', response);
  
        if (response.status === 200) {
          // console.log('Product details fetched successfully:', response.data);
          return response.data; // 메서드를 호출한 곳으로 데이터 반환
        } else {
          console.error('Failed to fetch product details, status not 200:', response);
          throw new Error('제품 세부 정보 조회 실패'); // 메서드를 호출한 곳으로 오류 전달
        }
      } catch (error) {
        console.error('Error occurred while fetching product details:', error);
        throw error;
      }
    }
  };
  

const getters = {
  products: state => state.products
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
