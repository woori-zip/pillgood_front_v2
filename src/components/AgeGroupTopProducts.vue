<template>
  <div>
    <div class="chart-container">
      <h4 class="text-melon">고객 선호 제품</h4>
      <canvas ref="chartCanvas"></canvas>
    </div>
    <br><br><br><hr style="background: gray; width: 600px; margin: auto"><br>
    <div class="product-container">
      <div v-for="(product, index) in recommendedProducts" :key="index" class="product-grid-item">
        <div class="product-item box-shadow">
          <router-link :to="{ name: 'ProductDetail', params: { id: product.productId } }">
            <div class="item-image"><img :src="getImageUrl(product.productImage)" alt="productImg"></div>
            <h5>{{ product.productName }}</h5>
          </router-link>
          <button 
            :disabled="isAddedToCart[product.productId]"
            @click="addToCart(product.productId)"
            class="btn btn-green">
            {{ isAddedToCart[product.productId] ? "담겼습니다 ✅" : "장바구니에 담기" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import Chart from 'chart.js/auto';
import axios from 'axios';

export default {
  name: 'TopProductsChart',
  setup() {
    const chartCanvas = ref(null);
    const chartInstance = ref(null);
    const store = useStore();
    const recommendedProducts = ref([]);
    const isAddedToCart = ref({});

    const fetchTopProducts = async () => {
      const response = await axios.get('/api/surveys/top-products');
      const products = response.data;
      
      // Fetch detailed product information from the store
      await store.dispatch('product/fetchProducts');
      const allProducts = store.state.product.products;
      recommendedProducts.value = products.map(topProduct => {
        return allProducts.find(product => product.productId === topProduct.product_id);
      });

      return products;
    };

    const getImageUrl = (htmlString) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      const img = doc.querySelector('img');
      return img ? img.src : '';
    };

    const addToCart = async (productId) => {
      try {
        const response = await store.dispatch('cart/addToCart', { productId, productQuantity: 1 });
        if (response.status === 201) {
          isAddedToCart.value[productId] = true;
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    };

    onMounted(async () => {
      const topProducts = await fetchTopProducts();
      createChart(topProducts);
    });

    const createChart = (topProducts) => {
      const ctx = chartCanvas.value.getContext('2d');
      const labels = topProducts.map(product => product.product_name);
      const data = topProducts.map(product => product.total_quantity_sold);

      if (chartInstance.value) {
        chartInstance.value.destroy();
      }

      chartInstance.value = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: '판매량',
            data: data,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            barThickness: 20 // 막대 두께 조정
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y', // 가로 막대형 차트로 변경
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              },
              grid: {
                display: false
              }
            },
            y: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    };

    return {
      chartCanvas,
      recommendedProducts,
      isAddedToCart,
      addToCart,
      getImageUrl
    };
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px; /* 차트 높이 조정 */
  width: 100%;
}

.product-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 10px;
}

.product-grid-item {
  display: flex;
  justify-content: center;
}

/* .product-item {
  width: 100%;
  padding: 7px;
  text-align: center;
  justify-content: center;
} */

.item-image {
  width: 200px;
  height: 200px;
  display: block;
  margin-bottom: 10px;
  border-radius: 15px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.btn {
  margin-top: 10px;
  display: inline-block;
}

/* 반응형 디자인을 위한 미디어 쿼리 */
@media (max-width: 600px) {
  .product-container {
    grid-template-columns: 1fr; /* 화면이 좁아지면 세로 배열 */
  }
}
</style>
