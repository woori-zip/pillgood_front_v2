<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { defineComponent, ref, onMounted, watch } from 'vue';

// Chart.js에서 모든 요소를 등록합니다.
Chart.register(...registerables);

export default defineComponent({
  name: 'LineChart',
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const chartCanvas = ref(null);
    let chartInstance = null;

    const createChart = () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
      chartInstance = new Chart(chartCanvas.value, {
        type: 'line',
        data: props.chartData,
        options: props.options,
      });
    };

    onMounted(createChart);
    watch(props.chartData, createChart);

    return {
      chartCanvas,
    };
  },
});
</script>

<style scoped>
.chart-container {
  height: 100%;
  width: 100%;
}
</style>
