<template>
    <div class="main-container box-shadow">
      <h4 class="payment-title text-melon">결제 승인</h4>
      <div v-if="currentOrder">
        <div class="order-summary">
          <p>주문번호: {{ currentOrder.orderNo }}</p>
          <p>수령인: {{ currentOrder.recipient }}</p>
          <p>총 금액: {{ totalAmount }} 원</p>
          <!-- 기타 필요한 주문 정보를 추가하세요 -->
        </div>
        <button @click="approvePayment" class="btn btn-green">결제 승인</button>
      </div>
      <div v-else>
        <p>로딩 중...</p>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState, mapGetters, mapActions } from 'vuex';
  import axios from 'axios';
  
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
      }
    }
  };
  </script>
  
  <style scoped>
  .main-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .payment-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .order-summary {
    margin-bottom: 20px;
    font-size: 1rem;
  }
  
  .order-summary p {
    margin: 10px 0;
  }
  
  .btn {
    display: block;
    width: 100%;
    padding: 10px;
    background-color: #5cb85c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.2rem;
    text-align: center;
  }
  
  .btn:hover {
    background-color: #4cae4c;
  }
  
  .loading {
    font-size: 1.2rem;
    text-align: center;
    margin-top: 20px;
  }
  </style>
  