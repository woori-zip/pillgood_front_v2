<template>
  <div class="main-container">
    <h1>주문 내역</h1>

    <!-- 주문 리스트 -->
    <div v-for="order in orders" :key="order.orderNo" class="order-container">
      <!-- 주문상세 리스트 -->
      <div v-for="detail in order.details" :key="detail.orderDetailNo" style="border-radius: 10px; height: 200x; padding: 20px 20px 0 20px" class="box-shadow">
        <p style="text-align: left; font-weight: bold; font-size: 20px;">{{ order.orderStatus }}</p>
        <div style="display: flex">
          <img :src="getProductImage(detail.productId)" style="height: 100px; width: auto; border-radius: 15px; margin-right: 20px;">
          <div>
            <p style="text-align: left;">
              <span style="color:gray;">{{ formatDate(order.orderDate) }}</span><br>
              <span style="font-size:20px;">{{ getProductName(detail.productId) }}</span><br>
              <span style="font-size:20px; font-weight:bold">{{ detail.amount }}원</span><br>
              <a href="#">주문상세></a>
            </p>
          </div>
        </div>
        <div class="btn-container" v-if="order.orderStatus !== '배송완료'">
          <button class="btn btn-green">구매확정</button>
          <button class="btn btn-gray" @click="goToReturnPage(order, detail, '반품')">반품요청</button>
          <button class="btn btn-gray" @click="goToReturnPage(order, detail, '교환')">교환요청</button>
        </div>
        <div class="btn-container" v-else>
          <button class="btn btn-green" @click="goToReviewPage(order, detail)">리뷰쓰기</button>
          <button class="btn btn-gray">재구매</button>
        </div>
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

        // 주문 날짜 기준으로 내림차순 정렬
        this.orders = response.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        // 각 주문에 대한 상세 내역을 병렬로 가져옵니다.
        await Promise.all(this.orders.map(async (order) => {
          const detailsResponse = await axios.get(`/api/order-details/order/${order.orderNo}`);
          console.log(`주문 번호 ${order.orderNo}의 상세 내역:`, detailsResponse.data);
          order.details = detailsResponse.data; // order 객체에 details를 직접 추가

          // 각 제품에 대한 상세 정보를 병렬로 가져옵니다.
          await Promise.all(detailsResponse.data.map(async (detail) => {
            if (!this.products[detail.productId]) {
              const productResponse = await axios.get(`/api/products/detail/${detail.productId}`);
              console.log(`제품 ID ${detail.productId}의 상세 정보:`, productResponse.data);
              this.products[detail.productId] = productResponse.data;
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
    formatDate(dateString) {
      const options = { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      const date = new Date(dateString);
      return `${date.toLocaleDateString('ko-KR', options).replace(/\./g, '.').replace(/\s/g, '').slice(0, -1)} 주문`;
    },
    goToReviewPage(order, detail) {
      this.$router.push({
        name: 'ReviewCreate',
        query: {
          orderNo: order.orderNo,
          orderDate: order.orderDate,
          productId: detail.productId,
          productName: this.getProductName(detail.productId),
          productImage: this.getProductImage(detail.productId),
          orderDetailNo: detail.orderDetailNo // orderDetailNo 추가
        }
      });
    },
    goToReturnPage(order, detail, requestType) {
      this.$router.push({
        name: 'RefundCreate', // 기존 ReturnCreate를 RefundCreate로 변경
        query: {
          orderNo: order.orderNo,
          orderDate: order.orderDate,
          productId: detail.productId,
          productName: this.getProductName(detail.productId),
          productImage: this.getProductImage(detail.productId),
          orderDetailNo: detail.orderDetailNo,
          requestType: requestType,
          refundAmount: detail.amount // 환불 금액을 쿼리 파라미터로 전달
        }
      });
    }
  },
  async created() {
    await this.fetchOrders();
  }
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
</style>
