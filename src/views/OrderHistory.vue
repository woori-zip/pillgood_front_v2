<template>
  <div class="main-container">
    <h1>주문 내역</h1>

    <!-- 주문 리스트 -->
    <div v-for="order in orders" :key="order.orderNo" class="order-container box-shadow" style="padding:20px">
      <p style="text-align: left;">
        <span style="font-weight: bold; font-size: 20px;">{{ order.orderStatus }}</span> 
        {{ order.orderNo }} 
        <span style="color:gray;">{{ formatDate(order.orderDate) }}</span><br>
      </p>
      <p style="text-align: left;">
        <span style="font-size:20px;">총액: {{ order.totalAmount }}원</span><br>
        <router-link :to="{ name: 'OrderDetail', params: { orderNo: order.orderNo }}">주문상세보기</router-link>
      </p>
      <div v-if="order.orderStatus !== '구매확정'" class="btn-container">
        <button class="btn btn-green" @click="confirmPurchase(order.orderNo)">구매확정</button>
        <button class="btn btn-gray" @click="goToReturnPage(order, null, '반품')">환불요청</button>
      </div>
    </div>
  </div>
</template>


<script>
import axios from '../axios'; // 'axios.js' 설정 파일을 import

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
        const response = await axios.get('/api/orders/member'); // 사용자 주문 내역 호출
        console.log("주문 테이블에서 불러온 정보:", response.data);
        this.orders = response.data;

        // 주문 날짜 기준으로 내림차순 정렬
        this.orders = response.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        this.loading = false;
      }
    },
    async confirmPurchase(orderNo) {
      try {
        const response = await axios.put(`/api/orders/update-status/${orderNo}`, { status: '구매확정' }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log("구매확정 업데이트:", response.data);
        // 상태 업데이트 후, 목록을 다시 불러옵니다.
        await this.fetchOrders();
      } catch (error) {
        console.error('Failed to confirm purchase:', error);
      }
    },
    formatDate(dateString) {
      const options = { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      const date = new Date(dateString);
      return `${date.toLocaleDateString('ko-KR', options).replace(/\./g, '.').replace(/\s/g, '').slice(0, -1)} 주문`;
    }
  },
  async created() {
    await this.fetchOrders();
    console.log("OrderList created");
  }
};
</script>




<style scoped>
.order-history-container {
  padding: 20px;
}

.loading {
  font-size: 20px;
}

.order-container {
  margin-bottom: 20px;
}
</style>
