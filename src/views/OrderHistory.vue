<template>
  <div class="main-container">
    <h2 class="text-melon">주문 내역</h2>
    <div class="breadcrumb">
      <p><a href="/mypage">> 마이페이지로 돌아가기</a></p>
    </div>
    <div class="box-container-no-shade">
      <div v-if="orders && orders.length > 0">
        <div v-for="order in orders" :key="order.orderNo" class="box-container">
          <h4 class="text-melon" style="text-align: left;">
          {{ formatProductNames(order.orderDetails) }}
          </h4>
          <p style="text-align: left;">
            <span style="font-weight: bold; font-size: 20px;">{{ order.orderStatus }}</span><br>
            <span>{{ order.orderNo }}</span><br>
            <span style="color:gray;">{{ formatDate(order.orderDate) }}</span><br>
          </p>
          <p style="text-align: left;">
            <span style="font-size:20px;">총액: {{ formatPrice(order.totalAmount) }} 원</span><br>
            <router-link :to="{ name: 'OrderDetail', params: { orderNo: order.orderNo }}">주문상세보기</router-link>
          </p>
          <div v-if="order.orderStatus !== '구매확정' && order.orderStatus !== '결제취소' && order.orderStatus !== '환불완료' && order.orderStatus !== '주문취소'" class="btn-container">
            <button class="btn btn-green" @click="confirmPurchase(order.orderNo)">구매확정</button>
            <button class="btn btn-gray" @click="goToReturnPage(order)">환불요청</button>
          </div>
        </div>
      </div>
      <div v-else><p>주문 내역이 없습니다.</p></div>
    </div>
  </div>
</template>

<script>
import axios from '../axios';
import '../assets/styles.css';

export default {
  data() {
    return {
      orders: [],
      loading: true,
    };
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await axios.get('/api/orders/member');
        const orders = response.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        // 각 주문에 대해 주문 상세 정보를 가져와 추가합니다.
        await Promise.all(orders.map(async (order) => {
          const detailsResponse = await axios.get(`/api/order-details/order/${order.orderNo}`);
          order.orderDetails = await Promise.all(detailsResponse.data.map(async (detail) => {
            const productResponse = await axios.get(`/api/products/detail/${detail.productId}`);
            detail.productName = productResponse.data.productName || 'Unknown Product';
            return detail;
          }));
        }));

        this.orders = orders;
        console.log('Orders: ', this.orders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        this.loading = false;
      }
    },
    formatPrice(value) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    formatProductNames(orderDetails) {
      if (!orderDetails || orderDetails.length === 0) return '상품 정보 없음';
      const firstProductName = orderDetails[0].productName || 'Unknown Product';
      const additionalProductsCount = orderDetails.length - 1;
      return additionalProductsCount > 0
        ? `${firstProductName} 외 ${additionalProductsCount} 개`
        : firstProductName;
    },
    async confirmPurchase(orderNo) {
      try {
        await axios.put(`/api/orders/update-status/${orderNo}`, { status: '구매확정' });
        await this.fetchOrders();
      } catch (error) {
        console.error('Failed to confirm purchase:', error);
      }
    },
    goToReturnPage(order) {
      this.$router.push({ name: 'CancelPayment', params: { orderNo: order.orderNo } });
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', options).replace(/\./g, '.');
    }
  },
  async created() {
    await this.fetchOrders();
  }
};
</script>

<style scoped>
.main-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  font-size: 20px;
}

.box-container {
  margin-top: 20px;
}

.btn-container {
  display: flex;
  gap: 10px;
}

.breadcrumb {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 20px;
}

.breadcrumb a {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 20px;
}
</style>
