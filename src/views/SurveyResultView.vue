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

    onMounted(async () => {
      const memberId = store.state.member.memberId;
      console.log('memberId:', memberId);
      await store.dispatch('survey/loadSurveyResult', memberId);
      console.log('surveyResult:', surveyResult.value);
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
@import '../assets/styles.css';
</style>
