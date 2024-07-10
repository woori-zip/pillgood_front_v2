<template>
  <div class="main-container">
    <h1 class="text-melon">설문 조사 결과</h1>
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else class="box-container box-shadow">
      <div v-if="surveyResult">
        <table class="line-table">
          <thead>
            <tr>
              <th>항목</th>
              <th>내용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>이름</td>
              <td>{{ surveyResult.name }}</td>
            </tr>
            <tr>
              <td>나이</td>
              <td>{{ surveyResult.age }}</td>
            </tr>
            <tr>
              <td>성별</td>
              <td>{{ surveyResult.gender }}</td>
            </tr>
            <tr>
              <td>키 (cm)</td>
              <td>{{ surveyResult.height }}</td>
            </tr>
            <tr>
              <td>몸무게 (kg)</td>
              <td>{{ surveyResult.weight }}</td>
            </tr>
            <tr>
              <td>신체질량지수 (BMI)</td>
              <td>{{ calculateBMI(surveyResult.weight, surveyResult.height) }}</td>
            </tr>
            <tr>
              <td>결핍 ID 1</td>
              <td>{{ surveyResult.deficiencyId1 }}</td>
            </tr>
            <tr>
              <td>결핍 ID 2</td>
              <td>{{ surveyResult.deficiencyId2 }}</td>
            </tr>
            <tr>
              <td>결핍 ID 3</td>
              <td>{{ surveyResult.deficiencyId3 }}</td>
            </tr>
            <tr>
              <td>추천 제품</td>
              <td>{{ surveyResult.recommendedProducts }}</td>
            </tr>
            <tr>
              <td>키워드</td>
              <td>{{ surveyResult.keywords }}</td>
            </tr>
          </tbody>
        </table>
        <div class="chart-container">
          <canvas id="bmiChart"></canvas>
        </div>
      </div>
      <div v-else>
        <p>설문 결과를 불러오는 중입니다...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(annotationPlugin);

export default {
  name: 'SurveyResult',
  setup() {
    const store = useStore();
    const isLoading = computed(() => store.state.survey.isLoading);
    const surveyResult = computed(() => store.getters['survey/surveyResult']);

    const calculateBMI = (weight, height) => {
      if (!weight || !height) return 'N/A';
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(2);
    };

    const createChart = (bmi) => {
      const ctx = document.getElementById('bmiChart').getContext('2d');
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
                  xMin: bmi,
                  xMax: bmi,
                  borderColor: 'rgba(255, 99, 132, 1)',
                  borderWidth: 2,
                  label: {
                    content: `나의 BMI: ${bmi}`,
                    enabled: true,
                    position: 'top'
                  }
                }
              }
            }
          }
        }
      });
    };

    onMounted(async () => {
      const memberId = store.state.member.memberId;
      console.log('memberId:', memberId);
      await store.dispatch('survey/loadSurveyResult', memberId);
      console.log('surveyResult:', surveyResult.value);

      if (surveyResult.value) {
        const bmi = calculateBMI(surveyResult.value.weight, surveyResult.value.height);
        createChart(bmi);
      }
    });

    return {
      isLoading,
      surveyResult,
      calculateBMI
    };
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 50px;
  width: 100%;
}
@import '../assets/styles.css';
</style>
