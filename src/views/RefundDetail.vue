<template>
  <div class="main-container">
    <div class="box-container">
      <div v-if="refunds.length === 0">
        <h2 class="text-melon">환불 요청 내역이 없습니다.</h2>
      </div>
      <div v-else>
        <div v-for="refund in refunds" :key="refund.refundId">
          <h2 class="text-melon">교환/반품/환불 요청이 성공적으로 접수되었습니다.</h2>
          <p><strong>주문 번호: {{ refund.orderNo }}</strong></p>
          <p>주문 금액: {{ refund.orderTotalAmount }}</p>
          <p>환불 금액: {{ refund.totalRefundAmount }}</p>
          <p>환불 상태: {{ refund.refundStatus }} </p>
        </div>
        <hr class="line">
        <div class="btn-container">
        <button @click="goHome" class="btn btn-green">홈으로 돌아가기</button>
        </div>
    </div>
    
    
    </div>
  </div>
</template>

<script>
import axios from '../axios';
import '../assets/styles.css';

export default {
  props: {
    orderNo: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      refunds: []
    };
  },
  async created() {
    try {
      const response = await axios.get(`/api/refunds/order/${this.orderNo}`);
      console.log('받은 데이터:', response.data);
      this.refunds = response.data;
    } catch (error) {
      console.error('환불 목록을 가져오는 중 오류가 발생했습니다:', error);
    }
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
  padding: 20px;
}
</style>
