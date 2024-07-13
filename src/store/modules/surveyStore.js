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
  selectedDeficiencies: [],
  recommendedProducts: [],
  surveyQuestions: [],
  surveyAnswers: [],
  selectedAnswers: {},
  detailedAnswers: {},
  deficiencies: [],
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
  setSelectedDeficiencies(state, deficiencies) {
    state.selectedDeficiencies = deficiencies;
  },
  setRecommendedProducts(state, products) {
    state.recommendedProducts = products;
  },
  setDeficiencies(state, deficiencies) {
    state.deficiencies = deficiencies;
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
  
      const surveyQuestions = questionsResponse.data.map(question => {
        const questionAnswers = answersResponse.data.filter(answer => answer.question_id === question.question_id);
        const matchedDetailedQuestions = new Set();
  
        questionAnswers.forEach(answer => {
          detailedQuestionsResponse.data.forEach(dq => {
            if (dq.deficiency_id === answer.deficiency_id) {
              matchedDetailedQuestions.add(JSON.stringify(dq));
            }
          });
        });
  
        return {
          ...question,
          detailedQuestions: Array.from(matchedDetailedQuestions).map(dq => JSON.parse(dq))
        };
      });
  
      const allDetailedQuestions = surveyQuestions.flatMap(q => q.detailedQuestions);
      const uniqueDetailedQuestions = Array.from(new Set(allDetailedQuestions.map(dq => JSON.stringify(dq)))).map(str => JSON.parse(str));
  
      // console.log('All Detailed Questions after mapping:', uniqueDetailedQuestions);
      console.log('Number of Detailed Questions after mapping:', uniqueDetailedQuestions.length);  
      commit('setSurveyQuestions', surveyQuestions);
      commit('setSurveyAnswers', answersResponse.data);
    } catch (error) {
      console.error('Failed to initialize survey:', error);
    } finally {
      commit('setLoading', false);
    }
  },
  nextStep({ commit, state, dispatch }) {
    if (state.currentStep === 'personal-info') {
      commit('setCurrentStep', 'questions');
    } else if (state.currentStep === 'questions' && state.currentQuestionIndex < state.surveyQuestions.length - 1) {
      commit('setCurrentQuestionIndex', state.currentQuestionIndex + 1);
    } else if (state.currentStep === 'questions' && state.currentQuestionIndex === state.surveyQuestions.length - 1) {
      const selectedDeficiencies = Object.values(state.selectedAnswers).map(answerId => {
        const answer = state.surveyAnswers.find(a => a.id === answerId);
        return answer ? answer.deficiencyId : null;
      }).filter(id => id !== null);
  
      const allDetailedQuestionsSet = new Set();
      state.surveyQuestions.forEach(q => {
        q.detailedQuestions.forEach(dq => {
          if (selectedDeficiencies.includes(dq.deficiencyId)) {
            allDetailedQuestionsSet.add(JSON.stringify(dq));
          }
        });
      });
  
      const allDetailedQuestions = Array.from(allDetailedQuestionsSet).map(dq => JSON.parse(dq));
      const filteredDetailedQuestions = allDetailedQuestions.filter(dq => selectedDeficiencies.includes(dq.deficiencyId));
  
      const groupedDetailedQuestions = filteredDetailedQuestions.reduce((acc, dq) => {
        (acc[dq.deficiencyId] = acc[dq.deficiencyId] || []).push(dq);
        return acc;
      }, {});
  
      commit('setCurrentDetailedQuestions', groupedDetailedQuestions);
      commit('setCurrentStep', 'detailed-questions');
      commit('setCurrentDetailedQuestionIndex', 0);
    } else if (state.currentStep === 'detailed-questions') {
      const totalDetailedQuestionsGroups = Object.keys(state.currentDetailedQuestions).length;
      if (state.currentDetailedQuestionIndex < totalDetailedQuestionsGroups - 1) {
        commit('setCurrentDetailedQuestionIndex', state.currentDetailedQuestionIndex + 1);
      } else if (state.currentDetailedQuestionIndex === totalDetailedQuestionsGroups - 1) {
        dispatch('finishSurvey');
      }
    }
  },
  previousStep({ commit, state }) {
    if (state.currentStep === 'detailed-questions' && state.currentDetailedQuestionIndex > 0) {
      commit('setCurrentDetailedQuestionIndex', state.currentDetailedQuestionIndex - 1);
    } else if (state.currentStep === 'detailed-questions' && state.currentDetailedQuestionIndex === 0) {
      commit('setCurrentStep', 'questions');
    } else if (state.currentStep === 'questions' && state.currentQuestionIndex > 0) {
      commit('setCurrentQuestionIndex', state.currentQuestionIndex - 1);
    } else {
      commit('setCurrentStep', 'personal-info');
    }
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
      } else {
        dispatch('nextStep');
      }
    } else {
      dispatch('nextStep');
    }
  },
  async fetchDeficiencies({ commit }) {
    try {
      const response = await axios.get('/api/deficiencies/list');
      commit('setDeficiencies', response.data);
    } catch (error) {
      console.error('Failed to fetch deficiencies:', error);
    }
  },
  async fetchProductsByDeficiency({ commit, state }) {
    try {
        const deficiencyIds = state.selectedDeficiencies.join(',');
        const response = await axios.get(`/api/products/by-deficiency?deficiencyIds=${deficiencyIds}`);
        commit('setRecommendedProducts', response.data);
    } catch (error) {
        console.error('Failed to fetch products by deficiency:', error);
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

      if (!survey.memberUniqueId) {
        throw new Error('memberUniqueId가 설정되지 않았습니다.');
      }

      const existingSurveys = await dispatch('loadSurveyResult', survey.memberUniqueId);
      if (existingSurveys && existingSurveys.length > 0) {
        await dispatch('updateSurvey', { id: existingSurveys[0].surveyNo, survey });
      } else {
        await dispatch('sendSurveyData', survey);
      }

      commit('setCurrentStep', 'finish');
    } catch (error) {
      console.error('Failed to finish survey:', error);
      alert('설문 완료 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  },
  async sendSurveyData(_, survey) {
    try {
      await axios.post('/api/surveys/create', survey);
    } catch (error) {
      console.error('Failed to send survey data to the server:', error);
      throw error;
    }
  },
  async updateSurvey(_, { id, survey }) {
    try {
      await axios.put(`/api/surveys/update/${id}`, survey);
    } catch (error) {
      console.error('Failed to update survey data:', error);
      throw error;
    }
  },
  async loadSurveyResult({ commit }, memberId) {
    try {
      const response = await axios.get(`/api/surveys/member/${memberId}`);
      commit('setSurveyResult', response.data.length ? response.data[0] : null);
      return response.data;
    } catch (error) {
      console.error('Failed to load survey result:', error);
      return null;
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
  isLastDetailedQuestionsGroup: (state) => state.currentDetailedQuestionIndex === Object.keys(state.currentDetailedQuestions).length - 1,
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
