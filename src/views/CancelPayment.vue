<template>
  <div class="main-container">
    <h2 class="text-melon">결제 취소 요청</h2>
    <div class="box-container-no-shade">
      <div class="input-group">
        <label for="paymentKey">결제 번호</label>
        <input type="text" id="paymentKey" v-model="paymentKey" readonly />
      </div>
      <div class="input-group">
        <label for="cancelAmount">취소 금액</label>
        <input type="number" id="cancelAmount" v-model="cancelAmount" readonly/>
      </div>
      <div class="input-group">
        <label for="cancelReason">취소 사유</label>
        <input type="text" id="cancelReason" v-model="cancelReason" />
      </div>
      <button class="btn btn-green" @click="cancelPayment">결제 취소</button>
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
.main-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
}

.input-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
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
</style>
