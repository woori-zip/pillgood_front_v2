<template>
  <div class="main-container">
    <h2 class="text-melon">나의 구독</h2>
    <div class="breadcrumb">
      <p><a href="/mypage">> 마이페이지로 돌아가기</a></p>
    </div>
    <div class="box-container-no-shade" v-if="subscriptions.length > 0">
      <div v-for="subscription in subscriptions" :key="subscription.subscriptionId" class="box-container" style="text-align: left;">
        <h4 class="text-melon" style="text-align: left;">
          {{ formatProductNames(subscription.orderDetails) }}
        </h4>
        <p>{{ formatDate(subscription.startDate) }} ~ {{ formatNextMonthDate(subscription.startDate) }}</p>
        <p>상태: <span :style="{ color: getStatusColor(subscription.subscriptionStatus) }">{{ formatStatus(subscription.subscriptionStatus) }}</span></p>
        <p>총액: {{ formatPrice(totalAmount(subscription.orderDetails)) }} 원</p>
        <button @click="toggleSubscriptionDetails(subscription.subscriptionId)" class="btn btn-green">
          {{ selectedSubscriptionId === subscription.subscriptionId ? '상세 정보 숨기기' : '상세 정보 보기' }}
        </button>
        <div v-if="selectedSubscriptionId === subscription.subscriptionId && subscription.orderDetails && subscription.orderDetails.length > 0">
          <ul style="list-style-type: none;">
            <li v-for="orderDetail in subscription.orderDetails" :key="orderDetail.orderDetailNo">
              {{ orderDetail.productName }} - {{ formatPrice(orderDetail.amount) }}원
            </li>
          </ul>
        </div>
        <div class="btns">
          <button class="btn btn-gray" @click="goToCancelSubscription(subscription)">구독 취소</button>
        </div>
      </div>
    </div>
    <div v-else>
      <p>구독 정보가 없습니다.</p>
    </div>
    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import '../assets/styles.css';

export default {
  data() {
    return {
      selectedSubscriptionId: null,
    };
  },
  computed: {
    ...mapState('subscriptions', ['subscriptions', 'loading', 'error']),
  },
  methods: {
    ...mapActions('subscriptions', ['fetchSubscriptions']),
    ...mapActions('product', ['fetchProductNameById']),
    ...mapActions('billing', ['fetchBillingKey', 'deleteBillingKey']),
    async setProductNames(subscriptions) {
      for (const subscription of subscriptions) {
        if (subscription.orderDetails) {
          for (const orderDetail of subscription.orderDetails) {
            const productName = await this.fetchProductNameById(orderDetail.productId);
            orderDetail.productName = productName;
          }
        }
      }
    },
    formatProductNames(orderDetails) {
      if (!orderDetails || orderDetails.length === 0) return '';
      const firstProductName = orderDetails[0].productName || 'Unknown Product';
      const additionalProductsCount = orderDetails.length - 1;
      return additionalProductsCount > 0
        ? `${firstProductName} 외 ${additionalProductsCount} 개`
        : firstProductName;
    },
    formatDate(dateString) {
      if (!dateString) return 'Invalid Date';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    },
    formatNextMonthDate(dateString) {
      if (!dateString) return 'Invalid Date';
      const date = new Date(dateString);
      date.setMonth(date.getMonth() + 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    },
    getStatusColor(status) {
      return status === 'T' ? 'green' : 'red';
    },
    async goToCancelSubscription(subscription) {
      if (!subscription.orderDetails || subscription.orderDetails.length === 0) {
        console.error('No order details found for this subscription.');
        return;
      }

      // const orderNo = subscription.orderDetails[0].orderNo; // 첫 번째 orderDetail의 orderNo 사용
      try {
        const billingKey = await this.fetchBillingKey(subscription.memberUniqueId);
        console.log('Billing Key:', billingKey); // 로그 추가

        if (billingKey) {
          this.$router.push({
            name: 'CancelSubscriptions',
            query: { billingKey }
          });
        } else {
          console.error('Failed to fetch billing key.');
        }
      } catch (error) {
        console.error('Failed to fetch billing key:', error);
      }
    },
    toggleSubscriptionDetails(subscriptionId) {
      if (this.selectedSubscriptionId === subscriptionId) {
        this.selectedSubscriptionId = null;
      } else {
        this.selectedSubscriptionId = subscriptionId;
      }
    },
    totalAmount(orderDetails) {
      return orderDetails.reduce((total, item) => total + item.amount, 0);
    },
    formatPrice(value) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    formatStatus(status) {
      return status === 'T' ? '구독 중' : '만료';
    }
  },
  async mounted() {
    const memberId = this.$store.state.member.memberId;
    await this.fetchSubscriptions(memberId);
    console.log('Subscriptions:', this.subscriptions); // 로그 추가
    await this.setProductNames(this.subscriptions);
  },
};
</script>

<style scoped>
.btns {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.btns button {
  width: 60px;
  white-space: nowrap;
  font-size: small;
}

.breadcrumb {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 20px;
}

.breadcrumb a {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 20px;
}
</style>
