<template>
  <div class="main-container">
        <h2 class="text-melon">보유 쿠폰</h2>
    <div class="box-container-no-shade">
    <div v-if="coupons && coupons.length > 0">
      <table class="line-table">
        <thead>
          <tr>
            <th>쿠폰명</th>
            <th>할인 금액</th>
            <th>유효 기간</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="coupon in coupons" :key="coupon.ownedCouponId">
            <td>{{ coupon.couponName }}</td>
            <td>{{ coupon.discountAmount }}원</td>
            <td>{{ formatDate(coupon.expiryDate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>보유한 쿠폰이 없습니다.</p>
    </div>
    </div>
  </div>
</template>

<script>
import axios from '../axios';
import '../assets/styles.css';

export default {
  name: 'MyCoupon',
  data() {
    return {
      coupons: []
    };
  },
  async created() {
    await this.fetchCoupons();
  },
  methods: {
    async fetchCoupons() {
      try {
        const response = await axios.get('/api/ownedcoupons/findbyid', { withCredentials: true });
        this.coupons = response.data;
        console.log('Fetched coupons:', this.coupons);
      } catch (error) {
        console.error('Failed to fetch coupons:', error);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    }
  }
};
</script>

<style scoped>
.main-container {
  padding: 20px;
}

.line-table {
  width: 100%;
  border-collapse: collapse;
}

.line-table th,
.line-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.line-table th {
  background-color: #f4f4f4;
}

.box-shadow {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>
