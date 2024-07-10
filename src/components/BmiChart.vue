<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(annotationPlugin);

export default {
  name: 'BmiChart',
  props: {
    bmi: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const chartCanvas = ref(null);

    const createChart = () => {
      if (chartCanvas.value) {
        const ctx = chartCanvas.value.getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['BMI'],
            datasets: [
              {
                label: '저체중',
                data: [18.5],
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1,
                stack: 'Stack 0'
              },
              {
                label: '정상',
                data: [4.5],
                backgroundColor: 'rgba(40, 167, 69, 0.5)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1,
                stack: 'Stack 0'
              },
              {
                label: '과체중',
                data: [2],
                backgroundColor: 'rgba(255, 193, 7, 0.5)',
                borderColor: 'rgba(255, 193, 7, 1)',
                borderWidth: 1,
                stack: 'Stack 0'
              },
              {
                label: '비만',
                data: [5],
                backgroundColor: 'rgba(220, 53, 69, 0.5)',
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 1,
                stack: 'Stack 0'
              },
              {
                label: '고도비만',
                data: [5],
                backgroundColor: 'rgba(128, 0, 0, 0.5)',
                borderColor: 'rgba(128, 0, 0, 1)',
                borderWidth: 1,
                stack: 'Stack 0'
              }
            ]
          },
          options: {
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
              x: {
                beginAtZero: true,
                max: 35,
                stacked: true
              },
              y: {
                stacked: true
              }
            },
            plugins: {
              annotation: {
                annotations: {
                  line1: {
                    type: 'line',
                    xMin: props.bmi,
                    xMax: props.bmi,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    label: {
                      content: `나의 BMI: ${props.bmi}`,
                      enabled: true,
                      position: 'top'
                    }
                  }
                }
              }
            }
          }
        });
      }
    };

    onMounted(() => {
      createChart();
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
  height: 100px;
  width: 100%;
}
</style>
