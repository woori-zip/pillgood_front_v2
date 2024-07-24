<template>
  <div class="main-container">
    <h2 class="text-melon">구독 취소</h2>
    <div class="box-container-no-shade">
      <div>
        <p>구독을 취소하시겠습니까?</p>
        <p>구독 상품: {{ $route.params.productName }}</p>
        <p>구독 금액: {{ formatPrice($route.params.billingAmount) }} 원</p>
        <textarea v-model="cancelReason" placeholder="취소 사유를 입력하세요"></textarea>
        <div class="btn-container">
          <button @click="cancelSubscription" class="btn btn-red">구독 취소</button>
          <router-link to="/mysubscriptions" class="btn btn-gray">취소</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'CancelSubscriptions',
  data() {
    return {
      billingKey: null,
      billingAmount: null,
      cancelReason: '',
    };
  },
  computed: {
    ...mapState('member', ['memberId']),
  },
  created() {
    this.billingKey = this.$route.params.billingKey;
    this.billingAmount = this.$route.params.billingAmount;
    console.log('Billing Key:', this.billingKey);
    console.log('Billing Amount:', this.billingAmount);
  },
  methods: {
    async cancelSubscription() {
      try {
        console.log('Canceling subscription with billing key:', this.billingKey);
        await this.$store.dispatch('billing/deleteBillingKey', this.memberId);
        console.log('Successfully deleted billing key');
        this.$router.push({ name: 'MySubscriptions' });
      } catch (error) {
        console.error('구독 취소 중 오류 발생:', error);
      }
    },
    formatPrice(value) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
  },
};
</script>

<style scoped>
.btn-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>
