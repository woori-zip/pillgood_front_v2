<template>
    <div>
      <h1>결제가 성공적으로 완료되었습니다!</h1>
      <p>주문 ID: {{ orderId }}</p>
      <p>결제 금액: {{ amount }} 원</p>
      <router-link to="/">홈으로 돌아가기</router-link>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        orderId: '',
        amount: ''
      };
    },
    created() {
      const urlParams = new URLSearchParams(window.location.search);
      this.orderId = urlParams.get('orderId');
      this.amount = urlParams.get('amount');
    }
  };
  </script>
  