<template>
  <div>
    <!-- <h1>Survey Result</h1> -->
    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <div v-if="surveyResult">
        <h2 class="text-melon">{{ surveyResult.name }} 님의 설문 결과</h2>
        <p>Name: {{ surveyResult.name }}</p>
        <p>Age: {{ surveyResult.age }}</p>
        <p>Gender: {{ surveyResult.gender }}</p>
        <p>Height: {{ surveyResult.height }}</p>
        <p>Weight: {{ surveyResult.weight }}</p>
        <br>
        <h4 class="text-melon">건강 키워드</h4>
        <p>#{{ surveyResult.deficiencyId1 }}</p>
        <p>#{{ surveyResult.deficiencyId2 }}</p>
        <p>#{{ surveyResult.deficiencyId3 }}</p>
        <br>
        <h4 class="text-melon"> 추천 제품</h4>
        <p>{{ surveyResult.recommendedProducts }}</p>
        <br>
        <h5 class="text-melon">키워드</h5>
        <p>{{ surveyResult.keywords }}</p>
      </div>
      <div v-else>
        <p>No survey result found.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters('member', ['getMemberUniqueId']),
    ...mapGetters('survey', ['surveyResult']),
  },
  created() {
    const memberUniqueId = this.getMemberUniqueId; // Vuex store에서 memberUniqueId 가져오기
    console.log('memberUniqueId:', memberUniqueId); // 확인용 로그
    if (memberUniqueId) {
      this.loadSurveyResult(memberUniqueId);
    }
  },
  methods: {
    ...mapActions('survey', ['loadSurveyResult']),
  }
};
</script>