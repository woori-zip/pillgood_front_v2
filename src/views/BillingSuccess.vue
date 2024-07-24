<template>
  <div class="main-container"> 
    <h3 class="text-melon">결제 완료</h3>
    <div v-if="response">
      <div class="box-container">
        <h1>결제가 성공적으로 완료되었습니다!</h1>
        <p>주문 ID: {{ response.orderId }}</p>
        <p>주문 이름: {{ response.orderName }}</p>
        <p>결제 금액: {{ response.totalAmount }} 원</p>
      </div>
      <div class="btn-container"><button @click="goHome" class="btn btn-green">홈으로 돌아가기</button></div>
    </div> 
    <div v-else>
      <p>로딩 중...</p>
    </div>
  </div>
</template>

<script>
import '../assets/styles.css';

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

</style>
