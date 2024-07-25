<template>
  <div class="main-container">
    <h3 class="text-melon">결제 완료</h3>
    <div v-if="response">
      <div class="box-container">
        <h1>결제가 성공적으로 완료되었습니다!</h1>
        <h4 class="text-melon">{{ formatProductNames(orderDetails) }}</h4>
        <p>주문 ID: {{ response.orderId }}</p>
        <p>결제 금액: {{ formatPrice(response.totalAmount) }} 원</p>
      </div>
      <div class="btn-container">
        <button @click="goHome" class="btn btn-green">홈으로 돌아가기</button>
      </div>
    </div>
    <div v-else>
      <p>로딩 중...</p>
    </div>
  </div>
</template>

<script>
import axios from '../axios';
import '../assets/styles.css';

export default {
  name: 'BillingSuccess',
  data() {
    return {
      response: JSON.parse(localStorage.getItem('paymentResponse')) || null,
      orderDetails: []
    };
  },
  methods: {
    goHome() {
      this.$router.push('/');
    },
    formatPrice(value) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    async fetchOrderDetails() {
      if (this.response && this.response.orderId) {
        try {
          const detailsResponse = await axios.get(`/api/order-details/order/${this.response.orderId}`);
          this.orderDetails = await Promise.all(detailsResponse.data.map(async (detail) => {
            const productResponse = await axios.get(`/api/products/detail/${detail.productId}`);
            detail.productName = productResponse.data.productName || 'Unknown Product';
            return detail;
          }));
        } catch (error) {
          console.error('Failed to fetch order details:', error);
        }
      }
    },
    formatProductNames(orderDetails) {
      if (!orderDetails || orderDetails.length === 0) return '상품 정보 없음';
      const firstProductName = orderDetails[0].productName || 'Unknown Product';
      const additionalProductsCount = orderDetails.length - 1;
      return additionalProductsCount > 0
        ? `${firstProductName} 외 ${additionalProductsCount} 개`
        : firstProductName;
    }
  },
  async mounted() {
    await this.fetchOrderDetails();
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
</style>
