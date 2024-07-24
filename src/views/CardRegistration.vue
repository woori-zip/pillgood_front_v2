<template>
  <div class="main-container">
    <h4 class="text-melon">카드 등록</h4>
    <div class="box-container">
      <div v-if="loading"> 
        <p>카드를 등록하는 중입니다. 잠시만 기다려주세요...</p>
      </div>
      <div v-else-if="billingKey">
        <p>카드가 성공적으로 등록되었습니다.</p>
        <div class="btn-container">
        <button @click="goToApprovePayment" class="btn btn-green">결제 요청 페이지로 이동</button></div>
      </div>
      <div v-else>
        <p>카드 등록에 실패했습니다. 다시 시도해주세요.</p>
      </div>
  </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import axios from 'axios';
import '../assets/styles.css';

export default {
  name: 'CardRegistration',
  data() {
    return {
      customerKey: null,
      authKey: null,
      billingKey: null,
      loading: true,
    };
  },
  computed: {
    ...mapState('order', {
      user: state => state.userProfile,
    })
  },
  async created() {
    await this.fetchUserProfile(); // 사용자 정보를 가져옵니다.
    this.loading = false;
    const urlParams = new URLSearchParams(window.location.search);
    this.customerKey = urlParams.get('customerKey');
    this.authKey = urlParams.get('authKey');

    if (this.customerKey && this.authKey) {
      try {
        // billing key 발급
        const billingResponse = await axios.post('/api/payment/issue-billing-key', {
          customerKey: this.customerKey,
          authKey: this.authKey
        });
        if (billingResponse.data && billingResponse.data.billingKey) {
          this.billingKey = billingResponse.data.billingKey;
          this.$store.commit('billing/setBillingKey', this.billingKey);
        } else {
          console.error('Billing key 발급 실패:', billingResponse);
        }
      } catch (error) {
        console.error('Billing key 발급 중 오류 발생:', error);
      }
    }
  },
  methods: {
    ...mapActions('order', ['fetchUserProfile']),
    goToApprovePayment() {
      this.$router.push({ name: 'ApprovePayment' });
    }
  }
};
</script>

<style scoped>

</style>
