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
  currentDetailedQuestionIndex: 0,
  currentDetailedQuestions: {},
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
  setCurrentDetailedQuestionIndex(state, index) {
    state.currentDetailedQuestionIndex = index;
  },
  setCurrentDetailedQuestions(state, questions) {
    state.currentDetailedQuestions = questions;
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

      console.log('Detailed Questions Response:', detailedQuestionsResponse.data);  // 디버그 로그 추가

      const surveyQuestions = questionsResponse.data.map(question => ({
        ...question,
        detailedQuestions: detailedQuestionsResponse.data.filter(dq => dq.deficiencyId === question.id)
      }));

      commit('setSurveyQuestions', surveyQuestions);
      commit('setSurveyAnswers', answersResponse.data);
      console.log('Survey Questions:', surveyQuestions);  // 디버그 로그 추가
      console.log('Survey Answers:', answersResponse.data);  // 디버그 로그 추가
    } catch (error) {
      console.error('Failed to initialize survey:', error);
    } finally {
      commit('setLoading', false);
    }
  },
  nextStep({ commit, state, dispatch }) {
    console.log('Current Step:', state.currentStep);  // 디버그 로그 추가
    console.log('Current Question Index:', state.currentQuestionIndex);  // 디버그 로그 추가
    console.log('Current Detailed Question Index:', state.currentDetailedQuestionIndex);  // 디버그 로그 추가
    console.log('Total Detailed Questions Groups:', Object.keys(state.currentDetailedQuestions).length);  // 디버그 로그 추가
  
    if (state.currentStep === 'personal-info') {
      commit('setCurrentStep', 'questions');
    } else if (state.currentStep === 'questions' && state.currentQuestionIndex < state.surveyQuestions.length - 1) {
      commit('setCurrentQuestionIndex', state.currentQuestionIndex + 1);
    } else if (state.currentStep === 'questions' && state.currentQuestionIndex === state.surveyQuestions.length - 1) {
      const selectedDeficiencies = Object.values(state.selectedAnswers).map(answerId => {
        const answer = state.surveyAnswers.find(a => a.id === answerId);
        return answer ? answer.deficiencyId : null;
      }).filter(id => id !== null);
  
      console.log('Selected Deficiencies:', selectedDeficiencies);  // 디버그 로그 추가
  
      const allDetailedQuestions = state.surveyQuestions.flatMap(q => q.detailedQuestions);
      console.log('All Detailed Questions:', allDetailedQuestions);  // 디버그 로그 추가
  
      const filteredDetailedQuestions = allDetailedQuestions.filter(dq => selectedDeficiencies.includes(dq.deficiencyId));
      console.log('Filtered Detailed Questions:', filteredDetailedQuestions);  // 디버그 로그 추가
  
      const groupedDetailedQuestions = filteredDetailedQuestions.reduce((acc, dq) => {
        (acc[dq.deficiencyId] = acc[dq.deficiencyId] || []).push(dq);
        return acc;
      }, {});
  
      console.log('Grouped Detailed Questions:', groupedDetailedQuestions);  // 디버그 로그 추가
  
      commit('setCurrentDetailedQuestions', groupedDetailedQuestions);
      commit('setCurrentStep', 'detailed-questions');
      commit('setCurrentDetailedQuestionIndex', 0);
  
      console.log('--------Total Detailed Questions Groups:', Object.keys(groupedDetailedQuestions).length);  // 여기서 로그 추가
    } else if (state.currentStep === 'detailed-questions') {
      const totalDetailedQuestionsGroups = Object.keys(state.currentDetailedQuestions).length;
      if (state.currentDetailedQuestionIndex < totalDetailedQuestionsGroups - 1) {
        commit('setCurrentDetailedQuestionIndex', state.currentDetailedQuestionIndex + 1);
      } else if (state.currentDetailedQuestionIndex === totalDetailedQuestionsGroups - 1) {
        console.log('Last detailed question reached, calling finishSurvey');  // 디버그 로그 추가
        dispatch('finishSurvey');
      }
    }
    console.log('Next Step - Current Step:', state.currentStep);  // 디버그 로그 추가
  },
  previousStep({ commit, state }) {
    console.log('Previous Step - Current Step:', state.currentStep);  // 디버그 로그 추가
    if (state.currentStep === 'detailed-questions' && state.currentDetailedQuestionIndex > 0) {
      commit('setCurrentDetailedQuestionIndex', state.currentDetailedQuestionIndex - 1);
    } else if (state.currentStep === 'detailed-questions' && state.currentDetailedQuestionIndex === 0) {
      commit('setCurrentStep', 'questions');
    } else if (state.currentStep === 'questions' && state.currentQuestionIndex > 0) {
      commit('setCurrentQuestionIndex', state.currentQuestionIndex - 1);
    } else {
      commit('setCurrentStep', 'personal-info');
    }
    console.log('Previous Step - New Current Step:', state.currentStep);  // 디버그 로그 추가
  },
  handleAnswerSelection({ commit, state, dispatch }) {
    const currentQuestion = state.surveyQuestions[state.currentQuestionIndex];
    const selectedAnswerId = state.selectedAnswers[currentQuestion.id];
    const selectedAnswer = state.surveyAnswers.find(a => a.id === selectedAnswerId);

    if (selectedAnswer) {
      const matchingDetailedQuestions = state.surveyQuestions.flatMap(q => q.detailedQuestions)
        .filter(dq => dq.deficiencyId === selectedAnswer.deficiencyId);
      if (matchingDetailedQuestions.length > 0) {
        commit('setCurrentDetailedQuestions', matchingDetailedQuestions);
        console.log('Matching Detailed Questions:', matchingDetailedQuestions);  // 디버그 로그 추가
      } else {
        dispatch('nextStep');
      }
    } else {
      dispatch('nextStep');
    }
  },
  async finishSurvey({ commit, state, dispatch }) {
    console.log('finishSurvey called');  // 디버그 로그 추가
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

      console.log('finishSurvey - memberUniqueId:', survey.memberUniqueId);  // 디버그 로그 추가
      console.log('finishSurvey - survey:', survey);  // 디버그 로그 추가

      if (!survey.memberUniqueId) {
        throw new Error('memberUniqueId가 설정되지 않았습니다.');
      }

      // 설문 데이터를 서버에 전송
      await dispatch('sendSurveyData', survey);

      // 설문 완료 단계로 설정
      commit('setCurrentStep', 'finish');
      console.log('Survey finished');  // 디버그 로그 추가
    } catch (error) {
      console.error('Failed to finish survey:', error);
      alert('설문 완료 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  },
  async sendSurveyData(_, survey) {
    try {
      console.log('Sending survey data to server:', survey);  // 디버그 로그 추가
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
  currentDetailedQuestionsGroup: (state) => {
    const deficiencyIds = Object.keys(state.currentDetailedQuestions);
    return state.currentDetailedQuestions[deficiencyIds[state.currentDetailedQuestionIndex]] || [];
  },
  isLastQuestion: (state) => state.currentQuestionIndex === state.surveyQuestions.length - 1,
  isLastDetailedQuestionsGroup: (state) => state.currentDetailedQuestionIndex === Object.keys(state.currentDetailedQuestions).length - 2,
  canProceed: (state, getters) => {
    if (state.currentStep === 'detailed-questions') {
      return getters.currentDetailedQuestionsGroup.every(dq => state.detailedAnswers[dq.detailedQuestionId] !== undefined);
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