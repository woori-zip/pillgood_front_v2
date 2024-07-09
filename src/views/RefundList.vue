<template>
  <div class="main-container">
    <h2>환불 요청 내역</h2>
    <div v-if="refunds.length === 0">환불 요청 내역이 없습니다.</div>
    <ul v-else>
      <li v-for="refund in refunds" :key="refund.refundId">
        <router-link :to="{ name: 'RefundDetail', params: { id: refund.refundId } }">
          주문 번호: {{ refund.orderNo }} / 환불 금액: {{ refund.totalRefundAmount }} / 환불 상태: {{ refund.refundStatus }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState({
      refunds: state => state.refund.refunds
    })
  },
  async created() {
    this.$store.dispatch('fetchRefunds');
  }
};
</script>

<style scoped>
.main-container {
  padding: 20px;
}
</style>
