<template>
  <div class="main-container">
    <h2>환불 요청 관리</h2>
    <div v-if="refunds.length === 0">환불 요청 내역이 없습니다.</div>
    <ul v-else>
      <li v-for="refund in refunds" :key="refund.refundId">
        주문 번호: {{ refund.orderNo }} / 환불 금액: {{ refund.totalRefundAmount }} / 환불 상태: {{ refund.refundStatus }}
        <select v-model="refund.refundStatus" @change="updateRefundStatus(refund)">
          <option value="환불대기">환불대기</option>
          <option value="환불승인">환불승인</option>
          <option value="환불완료">환불완료</option>
        </select>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from '../axios';

export default {
  data() {
    return {
      refunds: []
    };
  },
  async created() {
    try {
      const response = await axios.get('/api/refunds/list');
      this.refunds = response.data;
    } catch (error) {
      console.error('환불 목록을 가져오는 중 오류가 발생했습니다:', error);
    }
  },
  methods: {
    async updateRefundStatus(refund) {
      try {
        await axios.put(`/api/refunds/update-status/${refund.refundId}`, refund.refundStatus);
        console.log('환불 상태가 성공적으로 업데이트되었습니다.');
      } catch (error) {
        console.error('환불 상태 업데이트 중 오류가 발생했습니다:', error);
      }
    }
  }
};
</script>

<style scoped>
.main-container {
  padding: 20px;
}
</style>
