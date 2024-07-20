<template>
  <div class="main-container">
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else class="box-container-wide box-shadow">
      <div v-if="currentStep === 'personal-info'">
        <h2 class="text-melon">📝</h2>
        <table class="line-table">
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
                <option value="M">남성</option>
                <option value="F">여성</option>
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
          <div class="text-bold" style="display: flex; justify-content: center;">{{ currentQuestionIndex + 1 }}. {{ currentQuestion.questionContent }}</div>
          <div class="answer-container">
          <div class="check-container-vertical">
            <div v-for="answer in getAnswersForQuestion(currentQuestion.id)" :key="answer.id" class="form-check">
              <input
                :id="'answer-' + answer.id"
                :value="answer.id"
                type="checkbox"
                @change="handleAnswerSelection({ questionId: currentQuestion.id, answerId: answer.id })">
              <label :for="'answer-' + answer.id">{{ answer.answerContent }}</label>
            </div>
          </div>
          </div>
        </div>
        <div class="btn-container">
          <button @click="previousStep" class="btn btn-gray" v-if="currentQuestionIndex > 0">이전</button>
          <button @click="nextStep" class="btn btn-green" v-if="canProceed && !isLastQuestion">다음</button>
          <button @click="nextStep" class="btn btn-green" v-if="isLastQuestion && canProceed">다음</button>
        </div>
      </div>

      <div v-else-if="currentStep === 'detailed-questions'" class="survey">
        <h2 class="text-melon">🔎</h2>
        <p class="text-bold">· 해당하는 것을 모두 선택하세요</p>
        <div class="answer-container">
        <div v-for="dq in currentDetailedQuestionsGroup" :key="dq.detailedQuestionId">
          <div class="check-container-vertical">
            <input type="checkbox" :id="'answer-' + dq.detailedQuestionId" :value="dq.detailedQuestionId" v-model="detailedAnswers[dq.detailedQuestionId]">
            <label :for="'answer-' + dq.detailedQuestionId">{{ dq.questionContent }}</label>
          </div>
        </div>
        </div>
        <div class="btn-container">
          <button @click="previousStep" class="btn btn-gray">이전</button>
          <button @click="nextStep" class="btn btn-green" v-if="!isLastDetailedQuestionsGroup">다음</button>
          <button @click="finishSurvey" class="btn btn-green" v-if="isLastDetailedQuestionsGroup">완료</button>
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
    const survey = computed(() => store.state.survey.survey || {});
    const currentStep = computed(() => store.state.survey.currentStep);
    const currentQuestionIndex = computed(() => store.state.survey.currentQuestionIndex);
    const currentDetailedQuestionIndex = computed(() => store.state.survey.currentDetailedQuestionIndex);
    const currentDetailedQuestionsGroup = computed(() => store.getters['survey/currentDetailedQuestionsGroup']);
    const selectedAnswers = computed(() => store.state.survey.selectedAnswers);
    const detailedAnswers = computed(() => store.state.survey.detailedAnswers);
    const currentQuestion = computed(() => store.getters['survey/currentQuestion']);
    const isLastQuestion = computed(() => store.getters['survey/isLastQuestion']);
    const isLastDetailedQuestionsGroup = computed(() => store.getters['survey/isLastDetailedQuestionsGroup']);
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
      console.log('Next Step clicked');  // 디버그 로그 추가
      store.dispatch('survey/nextStep');
    };

    const previousStep = () => {
      console.log('Previous Step clicked');  // 디버그 로그 추가
      store.dispatch('survey/previousStep');
    };

    const handleAnswerSelection = (payload) => {
      console.log('Answer selected:', payload.questionId, payload.answerId);  // 디버그 로그 추가
      store.dispatch('survey/handleAnswerSelection', payload);
    };

    const finishSurvey = async () => {
      console.log('SurveyPage.vue - memberId:', store.state.member.memberId);
      console.log('Finish Survey clicked');  // 디버그 로그 추가

      await store.dispatch('survey/finishSurvey');
      goToSurveyResult();
    };

    const goToSurveyResult = () => {
      router.push('/surveyresult/:memberId');
    };

    return {
      isLoading,
      survey,
      currentStep,
      currentQuestion,
      currentQuestionIndex,
      currentDetailedQuestionIndex,
      currentDetailedQuestionsGroup,
      selectedAnswers,
      detailedAnswers,
      isLastQuestion,
      isLastDetailedQuestionsGroup,
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
.main-container {
  min-height: 600px;
}

.answer-container {
  min-height: 400px;
  overflow-y: auto;
}
</style>
