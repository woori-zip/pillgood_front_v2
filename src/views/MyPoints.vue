<template>
  <div class="main-container">
    <h2 class="text-melon">나의 포인트</h2>
    <div class="box-container-no-shade">
      <table class="line-table">
        <colgroup>
          <col style="width: 40%">
          <col style="width: 30%">
          <col style="width: 40%">
        </colgroup>
        <thead>
          <tr>
            <th>금액</th>
            <th>변동일시</th>
            <th>사유</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="point in pointsList" :key="point.point_id">
            <td :class="{ 'negative-amount': point.points < 0 }">{{ formatPoints(point.points) }}</td>
            <td>{{ formatDate(point.transactionDate) }}</td>
            <td>{{ formatStatus(point.pointStatusCode, point.referenceId) }}</td>
          </tr>
          <tr>
            <td colspan="3"> </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script>
import axios from '../axios';
import { mapState, mapActions } from 'vuex';
import '../assets/styles.css';

export default {
  computed: {
    ...mapState('point', ['pointsList', 'loading', 'error']),
  },
  methods: {
    ...mapActions('point', ['fetchPointsList']),
    formatDate(dateString) {
      if (!dateString) return 'Invalid Date';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    formatPoints(points) {
      return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    formatStatus(statusCode, referenceId) {
      // console.log('statusCode:', statusCode, 'referenceId:', referenceId); // 로그 추가
      if (statusCode === 'PU') {
        if (referenceId && referenceId.startsWith('REVOKE')) {
          return '결제 취소로 인한 반환';
        }
        return '사용';
      } else if (statusCode === 'PS') {
        return '적립';
      } else if (statusCode === 'UC') {
        return '결제 취소';
      }
      return '알 수 없음';
    },
    async fetchTotalPoints() {
      try {
        const response = await axios.get('/api/points/totalPoints', { withCredentials: true });
        this.totalPoints = this.formatPoints(response.data);
      } catch (error) {
        console.error('Error fetching total points:', error);
      }
    },
  },
  mounted() {
    this.fetchPointsList({ withCredentials: true })
  },
};
</script>

<style scoped>
.negative-amount {
  color: red;
}
</style>
