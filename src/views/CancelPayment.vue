<template>
  <div class="main-container">
   <div class="box-container">
    <h2 class="text-melon">결제 취소 요청</h2>
      <table class="line-table">
        <tr>
          <td><label for="paymentKey">결제 번호</label></td>
          <td><input type="text" id="paymentKey" v-model="paymentKey" readonly /></td>
        </tr>
        <tr>
          <td><label for="cancelAmount">취소 금액</label></td>
          <td><input type="number" id="cancelAmount" v-model="cancelAmount" readonly/></td>
        </tr>
        <tr>
          <td><label for="cancelReason">취소 사유</label></td>
          <td><input type="text" id="cancelReason" v-model="cancelReason" /></td>
        </tr>
      </table>
      <div class="btn-container">
        <button class="btn btn-green" @click="cancelPayment">결제 취소</button>
        <button class="btn btn-gray" @click="$router.go(-1)">돌아가기</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '../axios'; // 'axios.js' 설정 파일을 import

export default {
  data() {
    return {
      cancelReason: '',
      orderNo: this.$route.params.orderNo,
      paymentKey: null,
      cancelAmount: null,
    };
  },
  async created() {
    await this.fetchPaymentKey();
  },
  methods: {
    async fetchPaymentKey() {
      try {
        const response = await axios.get(`/api/payment/payment-info/${this.orderNo}`);
        if (response.status === 200 && response.data) {
          this.paymentKey = response.data.paymentNo; // 주문 정보에서 결제 키를 가져옵니다.
          this.cancelAmount = response.data.amount
        } else {
          console.error('결제 키를 가져오는 중 오류 발생:', response);
        }
      } catch (error) {
        console.error('결제 키를 가져오는 중 오류 발생:', error);
      }
    },
    async cancelPayment() {
      try {
        const response = await axios.post('/api/payment/cancel', {
          paymentKey: this.paymentKey,
          cancelReason: this.cancelReason
        });
        if (response.status === 200) {
          this.$router.push({ name: 'CancelSuccess' }); // 결제 취소 성공 페이지로 이동
        } else {
          console.error('결제 취소 요청 실패:', response);
        }
      } catch (error) {
        console.error('결제 취소 요청 중 오류 발생:', error);
      }
    }
  }
};
</script>

<style scoped>
@import '../assets/styles.css';

.line-table {
  width: 60%;
}
</style>
