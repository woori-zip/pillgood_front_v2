import axios from '../../axios';

const state = {
  products: [],
  topSellingProducts: [],
  latestProducts: [],
  productNames: {},
};

const mutations = {
  addProduct(state, product) {
    state.products.push(product);
  },
  setProducts(state, products) {
    state.products = products;
  },
  setTopSellingProducts(state, products) {
    state.topSellingProducts = products;
  },
  setLatestProducts(state, products) {
    state.latestProducts = products;
  },
  updateProductStatus(state, { productId, active }) {
    const product = state.products.find(product => product.productId === productId);
    if (product) {
      product.active = active;
    }
  },
  updateProduct(state, updatedProduct) {
    const index = state.products.findIndex(product => product.productId === updatedProduct.productId);
    if (index !== -1) {
      // 기존 제품 정보를 업데이트된 제품 정보로 교체
      state.products.splice(index, 1, updatedProduct);
    }
  },
  setProductName(state, { productId, productName }) {
    state.productNames = {
      ...state.productNames,
      [productId]: productName,
    };
  },
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
      const response = await axios.get('/api/products/list');
      // console.log('제품리스트조회response', response)
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
  async fetchProductsByDeficiency({ commit }, deficiencyIds) {
    try {
      const response = await axios.get('/api/products/by-deficiency', {
        params: { deficiencyIds: deficiencyIds.join(',') }
      });
      if (response.status === 200) {
        commit('setProducts', response.data);
      } else {
        throw new Error('제품 조회 실패');
      }
    } catch (error) {
      console.error('제품 조회 에러:', error);
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
  async fetchTopSellingProducts({ commit }) {
    try {
      const response = await axios.get('/api/products/top-selling');
      if (response.status === 200) {
        console.log('Original top selling products:', response.data);
        const products = response.data.filter(product => product.active === true);
        console.log('Filtered top selling products:', products); // Add this line to check filtering
        for (let product of products) {
          await fetchProductImage(product);
        }
        commit('setTopSellingProducts', products);
      } else {
        throw new Error('Failed to fetch top selling products');
      }
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      throw error;
    }
  },
  async fetchLatestProducts({ commit }) {
    try {
      const response = await axios.get('/api/products/latest');
      if (response.status === 200) {
        console.log('Original latest products:', response.data);
        const products = response.data.filter(product => product.active === true);
        console.log('Filtered latest products:', products); // Add this line to check filtering
        for (let product of products) {
          await fetchProductImage(product);
        }
        commit('setLatestProducts', products);
      } else {
        throw new Error('Failed to fetch latest products');
      }
    } catch (error) {
      console.error('Error fetching latest products:', error);
      throw error;
    }
  },
  // 비동기 방식 : 두 개의 매개변수를 받는데, 첫번째 매개변수는 사용하지 않으므로 '_'로 표시
  async fetchProductDetails(_, productId) {
    try {
      // console.log(`Fetching product details for ID: ${productId}`);
      const response = await axios.get(`/api/products/detail/${productId}`); // 요청 URL
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
  },
  async updateProduct({ commit }, updatedProduct) {
    try {
      const response = await axios.put(`/admin/products/update/${updatedProduct.productId}`, updatedProduct);
      if (response.status === 200) {
        commit('updateProduct', updatedProduct);
        console.log('제품 업데이트 성공:', response.data);
      } else {
        console.error('제품 업데이트 실패:', response.data);
        throw new Error('제품 업데이트 실패');
      }
    } catch (error) {
      console.error('제품 업데이트에 실패했습니다: ', error);
      throw error;
    }
  },
  async fetchProductNameById({ commit, state }, productId) {
    if (state.productNames[productId]) {
      return state.productNames[productId];
    }
    try {
      const response = await axios.get(`/api/products/detail/${productId}`);
      if (response.status === 200) {
        const productName = response.data.productName; // 적절한 필드를 사용하여 제품 이름을 가져옵니다.
        commit('setProductName', { productId, productName });
        return productName;
      } else {
        throw new Error('제품 이름 조회 실패');
      }
    } catch (error) {
      console.error('제품 이름 조회 에러:', error);
      throw error;
    }
  },
};

async function fetchProductImage(product) {
  try {
    const response = await axios.get(`/api/products/detail/${product.productId}`);
    product.productImage = extractFirstImage(response.data.productImage);
  } catch (error) {
    console.error(`Error fetching image for product ID ${product.productId}:`, error);
    product.productImage = null; // 기본 이미지로 설정
  }
}

function extractFirstImage(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const imgTag = doc.querySelector('img');
  return imgTag ? imgTag.src : null;
}

const getters = {
  products: state => state.products,
  topSellingProducts: state => state.topSellingProducts,
  latestProducts: state => state.latestProducts,
  productNames: state => state.productNames,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
