import axios from '../../axios';

const state = {
  topSellingProducts: [],
  latestProducts: []
};

const mutations = {
  setTopSellingProducts(state, products) {
    state.topSellingProducts = products;
  },
  setLatestProducts(state, products) {
    state.latestProducts = products;
  }
};

const actions = {
  async fetchTopSellingProducts({ commit }) {
    try {
      const response = await axios.get('/api/products/top-selling');
      if (response.status === 200) {
        const products = response.data;
        // 이미지 불러오기
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
        const products = response.data;
        // 이미지 불러오기
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
  }
};

const getters = {
  topSellingProducts: state => state.topSellingProducts,
  latestProducts: state => state.latestProducts
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

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
