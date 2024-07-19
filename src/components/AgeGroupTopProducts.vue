<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import axios from 'axios';

export default {
  name: 'TopProductsChart',
  setup() {
    const chartCanvas = ref(null);
    const chartInstance = ref(null);

    const fetchTopProducts = async () => {
      const response = await axios.get('/api/surveys/top-products');
      return response.data;
    };

    onMounted(async () => {
      const topProducts = await fetchTopProducts();
      createChart(topProducts);
    });

    const createChart = (topProducts) => {
      const ctx = chartCanvas.value.getContext('2d');
      const labels = topProducts.map(product => product.product_name);
      const data = topProducts.map(product => product.total_quantity_sold);

      if (chartInstance.value) {
        chartInstance.value.destroy();
      }

      chartInstance.value = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: '판매량',
            data: data,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y', // 가로 막대형 차트로 변경
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              },
              title: {
                display: true,
                text: '판매량 (개)'
              }
            },
            y: {
              title: {
                display: true,
                text: '제품'
              }
            }
          }
        }
      });
    };

    return {
      chartCanvas
    };
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 440                                   px; /* 차트 높이 조정 */
  width: 100%;
}
</style>
