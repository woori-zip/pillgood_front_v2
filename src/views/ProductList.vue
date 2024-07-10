<template>
  <div class="album py-5 bg-body-tertiary">
    <div class="container">
      <h2 class="text-melon" style="margin-bottom: 70px;">Product List</h2>
      <div class="row">
        <div class="col-lg-2 col-md-4 col-sm-6 text-center mb-3" v-for="product in products" :key="product.productId">
          <div class="card">
            <img @click="viewProduct(product.productId)" :src="product.productImage" class="card-img-top" alt="Product Image">
            <div class="card-body">
              <h6 class="card-title">{{ product.productName }}</h6>
              <p class="card-text">{{ product.price }}원</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import '../assets/styles.css';

export default {
  name: 'ProductListPage',
  data() {
    return {
      products: []
    };
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await axios.get('/api/products/list');
        this.products = response.data;

        // 각 제품에 대해 이미지를 추가로 가져오는 작업 수행
        for (let product of this.products) {
          await this.fetchProductImage(product);
        }
        console.log('Fetched products with images:', this.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    },
    async fetchProductImage(product) {
      try {
        const response = await axios.get(`/api/products/detail/${product.productId}`);
        product.productImage = this.extractFirstImage(response.data.productImage);
      } catch (error) {
        console.error(`Error fetching image for product ID ${product.productId}:`, error);
        product.productImage = null; // 기본 이미지로 설정
      }
    },
    viewProduct(productId) {
      this.$router.push({ name: 'ProductDetail', params: { id: productId } });
    },
    extractFirstImage(htmlString) {
      console.log('Extracting image from HTML string:', htmlString);
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      const imgTag = doc.querySelector('img');
      console.log('Parsed HTML:', doc);
      console.log('Image Tag:', imgTag);
      return imgTag ? imgTag.src : null;
    }
  },
  created() {
    this.fetchProducts();
  }
};
</script>

<style scoped>
.album {
  padding: 2rem 0;
}

.card {
  cursor: pointer;
  transition: transform 0.2s;
}

.card:hover {
  transform: scale(1.05);
}

.card-img-top {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-title {
  font-size: 1rem;
  margin-top: 10px;
}

.card-text {
  font-size: 1rem;
  font-weight: bold;
  color: #d9534f;
  margin-top: 5px;
}
</style>
