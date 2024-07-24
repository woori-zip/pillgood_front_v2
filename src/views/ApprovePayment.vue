<template>
    <div class="main-container"> 
      <h3 class="text-melon">결제 승인</h3>
      <div class="box-container">
        <div v-if="currentOrder">
          <div class="order-summary">
            <p>주문 번호: <strong>{{ currentOrder.orderNo }}</strong></p>
            <p>수령인: <strong>{{ currentOrder.recipient }}</strong></p>
            <p>총 금액: <strong>{{ formatPrice(totalAmount) }} 원</strong></p>
            <!-- 기타 필요한 주문 정보를 추가하세요 -->
          </div>
          <div class="btn-container">
          <button @click="approvePayment" class="btn btn-green">결제 승인</button></div>
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
        currentOrder: JSON.parse(localStorage.getItem('currentOrder')) || null
      };
    },
    computed: {
      ...mapGetters('member', ['memberId']),
      ...mapState('order', {
        user: state => state.userProfile,
      }),
      totalAmount() {
        return this.currentOrder ? this.currentOrder.totalAmount : 0; // 현재 주문 정보에서 최종 금액을 가져옵니다.
      }
    },
    async created() {
      if (!this.currentOrder) {
        await this.fetchUserProfile(); // 사용자 정보를 가져옵니다.
        await this.fetchOrderDetails(); // 주문 정보를 가져옵니다.
      }
      console.log('Current Order in ApprovePayment (created):', this.currentOrder); // 로깅 추가
    },
    methods: {
      ...mapActions('order', ['fetchUserProfile', 'fetchOrderDetails']),
      async approvePayment() {
        try {
          const response = await axios.post('/api/payment/confirm-billing', {
            amount: this.totalAmount,
            orderId: this.currentOrder.orderNo, // 현재 주문 번호를 사용합니다.
            orderName: '토스 프라임 구독',
            customerKey: this.memberId,
            customerEmail: this.user.email,
            customerName: this.user.name
          });
          if (response.status === 200) {
            localStorage.setItem('paymentResponse', JSON.stringify(response.data)); // response 값을 localStorage에 저장
            this.$router.push({ name: 'BillingSuccess' }); // 결제 성공 페이지로 이동
          } else {
            console.error('결제 승인 요청 실패:', response);
          }
        } catch (error) {
          console.error('결제 승인 요청 중 오류 발생:', error);
        }
      },
      formatPrice(value) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    }
  };
  </script>
  
  <style scoped>
  
  </style>
  