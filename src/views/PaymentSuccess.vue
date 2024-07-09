<template>
  <div>
    <h1>결제가 성공적으로 완료되었습니다!</h1>
    <p>주문 ID: {{ orderId }}</p>
    <p>결제 금액: {{ amount }} 원</p>
    <button @click="goHome">홈으로 돌아가기</button>
  </div>
</template>

<script>
import axios from '../axios';

export default {
  name: 'PaymentSuccess',
  data() {
    return {
      orderId: Array.isArray(this.$route.query.orderId) ? this.$route.query.orderId[0] : this.$route.query.orderId,
      amount: Array.isArray(this.$route.query.amount) ? this.$route.query.amount[0] : this.$route.query.amount,
      paymentKey: Array.isArray(this.$route.query.paymentKey) ? this.$route.query.paymentKey.find(key => key) : this.$route.query.paymentKey,
      customerName: this.$route.query.customerName,
      email: this.$route.query.email,
      phoneNumber: this.$route.query.phoneNumber
    };
  },
  async created() {
    try {
      await this.requestPaymentApproval();
    } catch (error) {
      console.error('결제 승인 요청 중 오류 발생:', error);
      alert('결제 승인 중 오류가 발생했습니다. 다시 시도하세요.');
    }
  },
  methods: {
    async requestPaymentApproval() {
      const paymentApproveRequest = {
        paymentKey: this.paymentKey,
        orderId: this.orderId,
        amount: parseInt(this.amount, 10), // 문자열을 숫자로 변환
        customerName: this.customerName,
        email: this.email,
        phoneNumber: this.phoneNumber
      };

      try {
        console.log('결제 승인 요청 전송:', paymentApproveRequest); // 디버깅을 위해 로그 추가
        const approveResponse = await axios.post('/api/payment/approve', paymentApproveRequest);
        if (approveResponse.status === 200) {
          console.log('결제 승인 성공:', approveResponse.data);
        } else {
          console.error('결제 승인 실패:', approveResponse);
          throw new Error('결제 승인 실패');
        }
      } catch (error) {
        console.error('결제 승인 에러:', error);
        throw error;
      }
    },
    goHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
/* 스타일을 여기에 추가하세요 */
</style>