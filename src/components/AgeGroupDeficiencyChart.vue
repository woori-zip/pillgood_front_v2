<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import Chart from 'chart.js/auto';

export default {
  name: 'AgeGroupDeficiencyChart',
  props: {
    userAge: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const chartCanvas = ref(null);
    const store = useStore();
    let chartInstance = null;

    const getAgeGroup = (age) => {
      if (age < 20) return '10-19';
      if (age < 30) return '20-29';
      if (age < 40) return '30-39';
      if (age < 50) return '40-49';
      if (age < 60) return '50-59';
      return '60+';
    };

    const createChart = (data) => {
      const ctx = chartCanvas.value.getContext('2d');
      const ageGroup = getAgeGroup(props.userAge);
      const filteredData = data.filter(item => item[0] === ageGroup);

      if (filteredData.length === 0) {
        console.warn(`No data available for age group: ${ageGroup}`);
        return;
      }

      const deficiencies = [...new Set(filteredData.map(item => item[1]))];
      const counts = deficiencies.map(deficiency => {
        return filteredData.reduce((acc, item) => {
          if (item[1] === deficiency) {
            return acc + item[2];
          }
          return acc;
        }, 0);
      });

      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: deficiencies,
          datasets: [{
            label: `Age Group: ${ageGroup}`,
            data: counts,
            backgroundColor: deficiencies.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`),
            borderColor: deficiencies.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`),
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              },
              title: {
                display: true,
                text: '인원 수 (명)'
              }
            },
            x: {
              title: {
                display: true,
                text: '결핍 유형'
              }
            }
          }
        }
      });
    };

    const loadDataAndCreateChart = () => {
      const data = store.getters['survey/ageGroupDeficiencyData'];
      if (data.length) {
        createChart(data);
      } else {
        console.error('차트를 생성할 데이터가 없습니다.');
      }
    };

    onMounted(() => {
      loadDataAndCreateChart();
    });

    watch(() => props.userAge, () => {
      loadDataAndCreateChart();
    });

    return {
      chartCanvas
    };
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}
</style>
