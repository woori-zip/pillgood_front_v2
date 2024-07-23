<template>
  <div class="chart-container">
    <h4 class="text-melon">{{ ageGroup }} 세가 자주 겪는 고민 Top 3</h4>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';
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

    const ageGroup = computed(() => getAgeGroup(props.userAge));

    const createChart = (data) => {
      const ctx = chartCanvas.value.getContext('2d');
      const filteredData = data.filter(item => item[0] === ageGroup.value);

      if (filteredData.length === 0) {
        console.warn(`No data available for age group: ${ageGroup.value}`);
        return;
      }

      // 결핍 유형별 총 인원 수를 계산하고 정렬
      const deficiencyCounts = filteredData.reduce((acc, item) => {
        const deficiency = item[1];
        const count = item[2];
        if (!acc[deficiency]) {
          acc[deficiency] = 0;
        }
        acc[deficiency] += count;
        return acc;
      }, {});

      // 상위 세 개 항목 선택
      const topDeficiencies = Object.entries(deficiencyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const deficiencies = topDeficiencies.map(item => item[0]);
      const counts = topDeficiencies.map(item => item[1]);

      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: deficiencies,
          datasets: [{
            label: `${ageGroup.value}`,
            data: counts,
            backgroundColor: [
              'rgba(170, 192, 192, 0.5)',
              'rgba(255, 159, 64, 0.5)',
              'rgba(153, 102, 255, 0.5)'
            ],
            borderWidth: 1,
            barThickness: 20 // 막대 두께 조정
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleFont: {
                size: 16
              },
              bodyFont: {
                size: 14
              },
              footerFont: {
                size: 12
              },
              cornerRadius: 8
            },
            legend: {
              position: 'top',
              labels: {
                font: {
                  size: 14
                }
              }
            }
          },
          indexAxis: 'y', // 가로 막대형 차트로 변경
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              },
              grid: {
                display: false
              }
            },
            y: {
              grid: {
                display: false
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
      store.dispatch('survey/fetchAgeGroupDeficiencyData').then(() => {
        loadDataAndCreateChart();
      });
    });

    watch(() => props.userAge, () => {
      loadDataAndCreateChart();
    });

    return {
      chartCanvas,
      ageGroup
    };
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px; /* 차트 높이 조정 */
  width: 100%;
}
</style>
