<template>
  <div class="main-container"> 
    <h3 class="text-melon">결제 승인</h3>
    <div class="box-container">
      <div v-if="currentOrder">
        <div class="order-summary">
          <h4 class="text-melon">{{ formatProductNames(currentOrder.orderDetails) }}</h4>
          <p>주문 번호: <strong>{{ currentOrder.orderNo }}</strong></p>
          <p>수령인: <strong>{{ currentOrder.recipient }}</strong></p>
          <p>총 금액: <strong>{{ formatPrice(totalAmount) }} 원</strong></p>
          <!-- 기타 필요한 주문 정보를 추가하세요 -->
        </div>
        <div class="btn-container">
          <button @click="approvePayment" class="btn btn-green">결제 승인</button>
        </div>
      </div>
      <div v-else>
        <p>로딩 중...</p>
      </div>
    </div>  
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import axios from 'axios';
import '../assets/styles.css';

export default {
  name: 'ApprovePayment',
  data() {
    return {
      currentOrder: JSON.parse(localStorage.getItem('currentOrder')) || null,
      orderDetails: []
    };
  },
  computed: {
    ...mapGetters('member', ['memberId']),
    ...mapState('order', {
      user: state => state.userProfile,
    }),
    totalAmount() {
      return this.currentOrder ? this.currentOrder.totalAmount : 0;
    }
  },
  async created() {
    if (this.currentOrder) {
      await this.fetchOrderDetails(this.currentOrder.orderNo);
    }
    console.log('Current Order in ApprovePayment (created):', this.currentOrder);
  },
  methods: {
    ...mapActions('order', ['fetchUserProfile']),
    async fetchOrderDetails(orderNo) {
      try {
        const detailsResponse = await axios.get(`/api/order-details/order/${orderNo}`);
        this.orderDetails = await Promise.all(detailsResponse.data.map(async (detail) => {
          const productResponse = await axios.get(`/api/products/detail/${detail.productId}`);
          detail.productName = productResponse.data.productName || 'Unknown Product';
          return detail;
        }));
        this.currentOrder.orderDetails = this.orderDetails;
        console.log('Order Details:', this.orderDetails);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      }
    },
    async approvePayment() {
      try {
        const response = await axios.post('/api/payment/confirm-billing', {
          amount: this.totalAmount,
          orderId: this.currentOrder.orderNo,
          orderName: this.formatProductNames(this.currentOrder.orderDetails),
          customerKey: this.memberId,
          customerEmail: this.user.email,
          customerName: this.user.name
        });
        if (response.status === 200) {
          localStorage.setItem('paymentResponse', JSON.stringify(response.data));
          this.$router.push({ name: 'BillingSuccess' });
        } else {
          console.error('결제 승인 요청 실패:', response);
        }
      } catch (error) {
        console.error('결제 승인 요청 중 오류 발생:', error);
      }
    },
    formatProductNames(orderDetails) {
      if (!orderDetails || orderDetails.length === 0) return '상품 정보 없음';
      const firstProductName = orderDetails[0].productName || 'Unknown Product';
      const additionalProductsCount = orderDetails.length - 1;
      return additionalProductsCount > 0
        ? `${firstProductName} 외 ${additionalProductsCount} 개`
        : firstProductName;
    },
    formatPrice(value) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
};
</script>

<style scoped>

</style>
