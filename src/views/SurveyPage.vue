<template>
  <div class="main-container">
    <h1 class="text-melon">설문 조사</h1>
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else class="box-container-wide box-shadow">
      <div v-if="currentStep === 'personal-info'">
        <h2 class="text-melon">📝</h2>
        <table class="mypage">
          <tr>
            <td><label for="name">이름</label></td>
            <td><input v-model="survey.name" type="text" id="name" required></td>
          </tr>
          <tr>
            <td><label for="age">나이</label></td>
            <td><input v-model="survey.age" type="number" id="age" required></td>
          </tr>
          <tr>
            <td><label for="gender">성별</label></td>
            <td>
              <select v-model="survey.gender" id="gender" required>
                <option value="">선택하세요</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </td>
          </tr>
          <tr>
            <td><label for="height">키 (cm)</label></td>
            <td><input v-model="survey.height" type="number" id="height" required></td>
          </tr>
          <tr>
            <td><label for="weight">몸무게 (kg)</label></td>
            <td><input v-model="survey.weight" type="number" id="weight" required></td>
          </tr>
        </table>
        <div class="btn-container">
          <button @click="nextStep" class="btn btn-green" :disabled="!isPersonalInfoComplete">다음</button>
        </div>
      </div>

      <div v-else-if="currentStep === 'questions'">
        <h2 class="text-melon">🔎</h2>
        <div v-if="currentQuestion">
          <p class="text-bold question-text">{{ currentQuestionIndex + 1 }}. {{ currentQuestion.questionContent }}</p>
           <div class="check-container-vertical">
            <div v-for="answer in getAnswersForQuestion(currentQuestion.id)" :key="answer.id" class="form-check">
              <input 
                :id="'answer-' + answer.id" 
                v-model="selectedAnswers[currentQuestion.id]" 
                :value="answer.id" 
                type="radio" 
                @change="handleAnswerSelection"
                required
              >
              <label :for="'answer-' + answer.id">{{ answer.answerContent }}</label>
            </div>
          </div>
        </div>
        <div v-if="currentDetailedQuestion" style="margin-top: 5px; padding: 10px">
          <p class="text-bold">{{ currentDetailedQuestion.questionContent }}</p>
          <div class="check-container">
            <input type="radio" id="yes" value="yes" v-model="detailedAnswers[currentDetailedQuestion.id]" required>
            <label for="yes">예</label>
            <input type="radio" id="no" value="no" v-model="detailedAnswers[currentDetailedQuestion.id]" required>
            <label for="no">아니오</label>
          </div>
        </div>
        <div class="btn-container">
          <button @click="previousStep" class="btn btn-gray" v-if="currentQuestionIndex > 0 || currentDetailedQuestion">이전</button>
          <button @click="nextStep" class="btn btn-green" v-if="canProceed && !isLastQuestion">다음</button>
          <button @click="finishSurvey" class="btn btn-green" v-if="isLastQuestion && canProceed">설문 완료</button>
        </div>
      </div>

      <div v-else-if="currentStep === 'finish'">
        <h2 class="text-melon">설문 완료</h2>
        <p>설문이 완료되었습니다. 결과를 확인하세요.</p>
        <div class="btn-container">
          <button @click="goToSurveyResult" class="btn btn-green">결과 보기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'SurveyPage',
  setup() {
    const router = useRouter();
    const store = useStore();

    const isLoading = computed(() => store.state.survey.isLoading);
    const survey = computed(() => store.state.survey.survey || {}); // survey가 null일 경우 빈 객체로 설정
    const currentStep = computed(() => store.state.survey.currentStep);
    const currentQuestionIndex = computed(() => store.state.survey.currentQuestionIndex);
    const currentDetailedQuestion = computed(() => store.state.survey.currentDetailedQuestion);
    const selectedAnswers = computed(() => store.state.survey.selectedAnswers);
    const detailedAnswers = computed(() => store.state.survey.detailedAnswers);
    const currentQuestion = computed(() => store.getters['survey/currentQuestion']);
    const isLastQuestion = computed(() => store.getters['survey/isLastQuestion']);
    const canProceed = computed(() => store.getters['survey/canProceed']);
    const isPersonalInfoComplete = computed(() => store.getters['survey/isPersonalInfoComplete']);

    const isLoggedIn = computed(() => store.state.member.isLoggedIn);

    onMounted(async () => {
      if (!isLoggedIn.value) {
        router.push('/login');
        return;
      }
      await store.dispatch('survey/loadSurveyData');
    });

    const getAnswersForQuestion = (questionId) => {
      return store.state.survey.surveyAnswers.filter(answer => answer.questionId === questionId);
    };

    const nextStep = () => {
      store.dispatch('survey/nextStep');
    };

    const previousStep = () => {
      store.dispatch('survey/previousStep');
    };

    const handleAnswerSelection = () => {
      store.dispatch('survey/handleAnswerSelection');
    };

    const finishSurvey = async () => {
      await store.dispatch('survey/finishSurvey');

      // 추가: 선택한 설문조사 데이터를 백엔드에 전송
      const surveyData = {
        survey: survey.value,
        selectedAnswers: selectedAnswers.value,
        detailedAnswers: detailedAnswers.value
      };
      try {
        await store.dispatch('survey/sendSurveyData', surveyData);
        console.log('Survey data sent successfully:', surveyData);
      } catch (error) {
        console.error('Failed to send survey data:', error);
      }
      goToSurveyResult();
    };

    const goToSurveyResult = () => {
      router.push('/surveyresult');
    };

    return {
      isLoading,
      survey,
      currentStep,
      currentQuestion,
      currentQuestionIndex,
      currentDetailedQuestion,
      selectedAnswers,
      detailedAnswers,
      isLastQuestion,
      canProceed,
      isPersonalInfoComplete,
      getAnswersForQuestion,
      nextStep,
      previousStep,
      handleAnswerSelection,
      finishSurvey,
      isLoggedIn
    };
  }
};
</script>

<style scoped>
/* 기존 스타일 유지 */

.btn-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>
