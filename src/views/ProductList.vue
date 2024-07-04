<template>
  <div class="main-container">
    <div class="box-container box-shadow">
      <h2 class="text-melon">Product List</h2>
      <div class="product-row">
        <div class="product-card" v-for="product in products" :key="product.productId">
          <img @click="viewProduct(product.productId)" src="../assets/product_01.png" alt="Product Image" class="product-image" />
          <div class="product-info">
            <div @click="viewProduct(product.productId)" class="product-name">{{ product.productName }}</div>
            <div class="product-price">{{ product.price }}원</div>
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
        const response = await axios.get('http://localhost:9095/products/list'); // 서버 주소와 엔드포인트 확인
        this.products = response.data;
        console.log('Fetched products:', this.products); // 디버깅 로그 추가
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    },
    viewProduct(productId) {
      this.$router.push({ name: 'ProductDetail', params: { id: productId } });
    }
  },
  created() {
    this.fetchProducts();
  }
};
</script>

<style scoped>
/* Main container styles */
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f9f9f9;
}

.box-container {
  width: 100%;
  max-width: 1200px; /* Adjust to control the maximum width */
  margin: 0 auto;
}

/* Product list styles */
.product-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start; /* Align items to the start */
  gap: 20px;
  margin-top: 20px;
}

.product-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: calc(25% - 20px); /* Adjust to fit 4 items in a row */
  text-align: center;
  padding: 2.5px;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 200px; /* Fixed width */
  height: 200px; /* Fixed height */
  object-fit: cover;
  border-radius: 8px;
}

.product-info {
  padding: 10px 0;
}

.product-name {
  font-size: 1rem;
  margin-top: 10px;
}

.product-price {
  font-size: 1rem;
  font-weight: bold;
  color: #d9534f;
  margin-top: 5px;
}

/* Page title styles */
.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  white-space: nowrap;
}
</style>