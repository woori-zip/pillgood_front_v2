<template>
  <div class="main-container box-shadow">
    <h4 class="payment-title text-melon">결제 완료</h4>
    <div v-if="response">
      <div class="order-summary">
        <h1>결제가 성공적으로 완료되었습니다!</h1>
        <p>주문 ID: {{ response.orderId }}</p>
        <p>주문 이름: {{ response.orderName }}</p>
        <p>결제 금액: {{ response.totalAmount }} 원</p>
      </div>
      <button @click="goHome" class="btn btn-green">홈으로 돌아가기</button>
    </div>
    <div v-else>
      <p>로딩 중...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BillingSuccess',
  data() {
    return {
      response: JSON.parse(localStorage.getItem('paymentResponse')) || null
    };
  },
  methods: {
    goHome() {
      this.$router.push('/');
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
