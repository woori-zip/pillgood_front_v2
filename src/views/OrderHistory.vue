<template>
  <div class="main-container">
    <h2 class="text-melon">주문 내역</h2>
    <div class="box-container-no-shade">
      <!-- 주문 리스트 -->
      <div v-for="order in orders" :key="order.orderNo" class="box-container">
        <p style="text-align: left;">
          <span style="font-weight: bold; font-size: 20px;">{{ order.orderStatus }}</span>
          {{ order.orderNo }}
          <span style="color:gray;">{{ formatDate(order.orderDate) }}</span><br>
        </p>
        <p style="text-align: left;">
          <span style="font-size:20px;">총액: {{ order.totalAmount }}원</span><br>
          <router-link :to="{ name: 'OrderDetail', params: { orderNo: order.orderNo }}">주문상세보기</router-link>
        </p>
        <div v-if="order.orderStatus !== '구매확정' && order.orderStatus !== '취소완료'" class="btn-container">
          <button class="btn btn-green" @click="confirmPurchase(order.orderNo)">구매확정</button>
          <button class="btn btn-gray" @click="goToReturnPage(order)">환불요청</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '../axios';
import '../assets/styles.css';

export default {
  data() {
    return {
      orders: [],
      loading: true,
    };
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await axios.get('/api/orders/member');
        this.orders = response.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        console.log('Orders: ', this.orders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        this.loading = false;
      }
    },
    async confirmPurchase(orderNo) {
      try {
        await axios.put(`/api/orders/update-status/${orderNo}`, { status: '구매확정' });
        await this.fetchOrders();
      } catch (error) {
        console.error('Failed to confirm purchase:', error);
      }
    },
    goToReturnPage(order) {
      this.$router.push({ name: 'CancelPayment', params: { orderNo: order.orderNo } });
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', options).replace(/\./g, '.');
    }
  },
  async created() {
    await this.fetchOrders();
  }
};
</script>

<style scoped>
.main-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  font-size: 20px;
}

.box-container {
  margin-top: 20px;
}

.btn-container {
  display: flex;
  gap: 10px;
}
</style>
