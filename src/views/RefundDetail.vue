<template>
  <div class="main-container">
    <h2>환불 요청 내역</h2>
    <div v-if="refunds.length === 0">환불 요청 내역이 없습니다.</div>
    <ul v-else>
      <li v-for="refund in refunds" :key="refund.refundId">
        주문 번호: {{ refund.orderNo }} / 환불 금액: {{ refund.totalRefundAmount }} / 환불 상태: {{ refund.refundStatus }}
      </li>
    </ul>
  </div>
</template>

<script>
import axios from '../axios';

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
  }
};
</script>

<style scoped>
.main-container {
  padding: 20px;
}
</style>
