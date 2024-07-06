<template>
  <div class="order-history-container">
    <h1>주문 내역</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else>
      <div v-for="order in orders" :key="order.orderNo" class="order-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th>제품 이미지</th>
              <th>제품 이름</th>
              <th>가격</th>
              <th>수량</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="detail in order.details" :key="detail.orderDetailNo">
              <td class="product_img"><img :src="getProductImage(detail.productId)" alt="Product Image" /></td>
              <td>{{ getProductName(detail.productId) }}</td>
              <td>{{ detail.amount }}</td>
              <td>{{ detail.quantity }}</td>
            </tr>
          </tbody>
        </table>
        <br/> <!-- 주문 간의 간격을 위해 줄바꿈 추가 -->
      </div>
    </div>
  </div>
</template>

<script>
import axios from '../axios'; // 'axios.js' 설정 파일을 import

export default {
  data() {
    return {
      orders: [],
      products: {}, // 제품 정보를 저장할 객체
      loading: true,
    };
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await axios.get('/api/orders/member'); // 사용자 주문 내역 호출
        console.log("주문 테이블에서 불러온 정보:", response.data);
        this.orders = response.data;

        // 각 주문에 대한 상세 내역을 병렬로 가져옵니다.
        await Promise.all(this.orders.map(async (order) => {
          const detailsResponse = await axios.get(`/api/order-details/order/${order.orderNo}`);
          console.log(`주문 번호 ${order.orderNo}의 상세 내역:`, detailsResponse.data);
          order.details = detailsResponse.data;

          // 각 제품에 대한 상세 정보를 병렬로 가져옵니다.
          await Promise.all(detailsResponse.data.map(async (detail) => {
            if (!this.products[detail.productId]) {
              const productResponse = await axios.get(`/api/products/detail/${detail.productId}`);
              console.log(`제품 ID ${detail.productId}의 상세 정보:`, productResponse.data);
              this.products = {
                ...this.products,
                [detail.productId]: productResponse.data
              };
            }
          }));
        }));
				
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        this.loading = false;
      }
    },
    getProductName(productId) {
      return this.products[productId] ? this.products[productId].productName : 'Loading...';
    },
    getProductImage(productId) {
      if (this.products[productId]) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.products[productId].productImage, 'text/html');
        const imgTag = doc.querySelector('img');
        return imgTag ? imgTag.src : '';
      }
      return '';
    },
  },
  async created() {
    await this.fetchOrders();
  },
};
</script>

<style scoped>
.order-history-container {
  padding: 20px;
}

.loading {
  font-size: 20px;
}

.orders-table,
.order-details-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.orders-table th,
.orders-table td,
.order-details-table th,
.order-details-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.orders-table th,
.order-details-table th {
  background-color: #f2f2f2;
}

.orders-table tr:hover {
  background-color: #f5f5f5;
}

.order-details {
  margin-top: 40px;
}

.order-container {
  margin-bottom: 20px;
}

.product_img {
	height: 50px;
}
</style>