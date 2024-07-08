import axios from '@/axios';
import store from '../index';

const state = {
  survey: {
    name: '',
    age: null,
    gender: '',
    height: null,
    weight: null,
    memberUniqueId: '',
    deficiencyId1: null,
    deficiencyId2: null,
    deficiencyId3: null,
  },
  surveyQuestions: [],
  surveyAnswers: [],
  selectedAnswers: {},
  detailedAnswers: {},
  isLoading: false,
  currentStep: 'personal-info',
  currentQuestionIndex: 0,
  currentDetailedQuestion: null,
  surveyResult: null,
};

const mutations = {
  setSurvey(state, payload) {
    state.survey = payload;
  },
  setSurveyQuestions(state, questions) {
    state.surveyQuestions = questions;
  },
  setSurveyAnswers(state, answers) {
    state.surveyAnswers = answers;
  },
  setSelectedAnswers(state, answers) {
    state.selectedAnswers = answers;
  },
  setDetailedAnswers(state, answers) {
    state.detailedAnswers = answers;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setCurrentStep(state, step) {
    state.currentStep = step;
  },
  setCurrentQuestionIndex(state, index) {
    state.currentQuestionIndex = index;
  },
  setCurrentDetailedQuestion(state, question) {
    state.currentDetailedQuestion = question;
  },
  setSurveyResult(state, surveyData) {
    state.surveyResult = surveyData;
  },
};

const actions = {
  async loadSurveyData({ commit }) {
    commit('setLoading', true);
    try {
      const [questionsResponse, answersResponse, detailedQuestionsResponse] = await Promise.all([
        axios.get('/api/questions/list'),
        axios.get('/api/surveyanswers/list'),
        axios.get('/api/detailed-questions/list')
      ]);

      const surveyQuestions = questionsResponse.data.map(question => ({
        ...question,
        detailedQuestions: detailedQuestionsResponse.data.filter(dq => dq.deficiencyId === question.id)
      }));

      commit('setSurveyQuestions', surveyQuestions);
      commit('setSurveyAnswers', answersResponse.data);
    } catch (error) {
      console.error('Failed to initialize survey:', error);
    } finally {
      commit('setLoading', false);
    }
  },
  nextStep({ commit, state }) {
    if (state.currentStep === 'personal-info') {
      commit('setCurrentStep', 'questions');
    } else if (state.currentDetailedQuestion) {
      commit('setCurrentDetailedQuestion', null);
      commit('setCurrentQuestionIndex', state.currentQuestionIndex + 1);
    } else {
      commit('setCurrentQuestionIndex', state.currentQuestionIndex + 1);
    }
  },
  previousStep({ commit, state }) {
    if (state.currentDetailedQuestion) {
      commit('setCurrentDetailedQuestion', null);
    } else if (state.currentQuestionIndex > 0) {
      commit('setCurrentQuestionIndex', state.currentQuestionIndex - 1);
    } else {
      commit('setCurrentStep', 'personal-info');
    }
  },
  handleAnswerSelection({ commit, state, dispatch }) {
    const currentQuestion = state.surveyQuestions[state.currentQuestionIndex];
    const selectedAnswerId = state.selectedAnswers[currentQuestion.id];
    const selectedAnswer = state.surveyAnswers.find(a => a.id === selectedAnswerId);

    if (selectedAnswer && currentQuestion.detailedQuestions) {
      const matchingDetailedQuestion = currentQuestion.detailedQuestions.find(dq => dq.deficiencyId === selectedAnswer.deficiencyId);
      if (matchingDetailedQuestion) {
        commit('setCurrentDetailedQuestion', matchingDetailedQuestion);
      } else {
        dispatch('nextStep');
      }
    } else {
      dispatch('nextStep');
    }
  },
  async finishSurvey({ commit, state, dispatch }) {
    try {
        const deficiencies = Object.values(state.selectedAnswers).map(answerId => {
            const answer = state.surveyAnswers.find(a => a.id === answerId);
            return answer ? answer.deficiencyId : null;
        }).filter(id => id !== null);

        const survey = {
          name: state.survey.name,
          age: state.survey.age,
          gender: state.survey.gender,
          height: state.survey.height,
          weight: state.survey.weight,
          memberUniqueId: store.state.member.memberId,
          deficiencyId1: deficiencies[0] || null,
          deficiencyId2: deficiencies[1] || null,
          deficiencyId3: deficiencies[2] || null,
          surveyDate: new Date().toISOString(),
          recommendedProducts: state.survey.recommendedProducts || '',
          keywords: state.survey.keywords || ''
        };

        console.log('finishSurvey - memberUniqueId:', survey.memberUniqueId);
        console.log('finishSurvey - survey:', survey);

        if (!survey.memberUniqueId) {
            throw new Error('memberUniqueId가 설정되지 않았습니다.');
        }

        // 설문 데이터를 서버에 전송
        await dispatch('sendSurveyData', survey);

        // 설문 완료 단계로 설정
        commit('setCurrentStep', 'finish');
    } catch (error) {
        console.error('Failed to finish survey:', error);
        alert('설문 완료 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  },
  async sendSurveyData(_, survey) {
    try {
      await axios.post('/api/surveys/create', survey);
      console.log('Survey data sent to the server:', survey);
    } catch (error) {
      console.error('Failed to send survey data to the server:', error);
      throw error;
    }
  },
  async loadSurveyResult({ commit }, memberId) {
    commit('setLoading', true);
    try {
      const response = await axios.get(`/api/surveys/member/${memberId}`);
      const surveyData = response.data[0];
      commit('setSurveyResult', surveyData);
    } catch (error) {
      console.error('Failed to load survey result:', error);
    } finally {
      commit('setLoading', false);
    }
  },
};

const getters = {
  currentQuestion: (state) => state.surveyQuestions[state.currentQuestionIndex],
  isLastQuestion: (state) => state.currentQuestionIndex === state.surveyQuestions.length - 1,
  canProceed: (state) => {
    if (state.currentDetailedQuestion) {
      return state.detailedAnswers[state.currentDetailedQuestion.id] !== undefined;
    }
    return state.selectedAnswers[state.surveyQuestions[state.currentQuestionIndex]?.id] !== undefined;
  },
  isPersonalInfoComplete: (state) => {
    return state.survey.name && 
           state.survey.age && 
           state.survey.gender && 
           state.survey.height && 
           state.survey.weight;
  },
  surveyResult: (state) => state.surveyResult,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};