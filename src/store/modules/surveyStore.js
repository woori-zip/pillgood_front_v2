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
  ageGroupDeficiencyData: [], // 추가된 부분
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
  setSelectedAnswers(state, { questionId, answerId }) {
    if (!Array.isArray(state.selectedAnswers[questionId])) {
      state.selectedAnswers[questionId] = [];
    }
    const selectedAnswers = state.selectedAnswers[questionId];
    const index = selectedAnswers.indexOf(answerId);
    if (index > -1) {
      selectedAnswers.splice(index, 1);
    } else {
      selectedAnswers.push(answerId);
    }
    console.log('Updated selectedAnswers:', state.selectedAnswers);  // 디버그 로그 추가
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
  setAgeGroupDeficiencyData(state, data) { // 추가된 부분
    state.ageGroupDeficiencyData = data;
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
      const selectedDeficiencies = Object.values(state.selectedAnswers).flatMap(answerIds => {
        return answerIds.map(answerId => {
          const answer = state.surveyAnswers.find(a => a.id === answerId);
          return answer ? answer.deficiencyId : null;
        }).filter(id => id !== null);
      });

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
  handleAnswerSelection({ commit }, { questionId, answerId }) {
    console.log('Handling answer selection:', questionId, answerId);  // 디버그 로그 추가
    commit('setSelectedAnswers', { questionId, answerId });
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
  async finishSurvey({ commit, state, dispatch, rootState }) {
    try {
      // deficiencyNutrients를 초기화
      await dispatch('deficiency/fetchDeficiencyNutrients', null, { root: true });

      // products 데이터 로드
      await dispatch('product/fetchProducts', null, { root: true });

      const deficiencies = Object.values(state.selectedAnswers).flatMap(answerIds => {
        return answerIds.map(answerId => {
          const answer = state.surveyAnswers.find(a => a.id === answerId);
          return answer ? answer.deficiencyId : null;
        }).filter(id => id !== null);
      });

      // 상세 질문에서 선택된 결핍 ID들을 keywords로 저장
      const detailedDeficiencies = Object.entries(state.detailedAnswers).flatMap(([questionId, isSelected]) => {
        if (isSelected) {
          // detailedQuestions에서 해당 질문 ID와 매칭되는 deficiencyId를 추출
          const detailedQuestion = Object.values(state.currentDetailedQuestions).flatMap(questions => 
            questions.filter(dq => dq.detailedQuestionId.toString() === questionId)
          );
          return detailedQuestion.length > 0 ? detailedQuestion.map(dq => dq.deficiencyId) : [];
        }
        return [];
      });

      // 저장되는 답변 확인용
      console.log('Selected detailedAnswers:', state.detailedAnswers);
      console.log('Extracted detailedDeficiencies:', detailedDeficiencies);

      // 결핍 ID로부터 추천 제품 찾기
      if (!rootState.deficiency.deficiencyNutrients) {
        console.error('rootState.deficiencyNutrients is undefined');
        return;
      }

      let recommendedProducts = deficiencies.flatMap(deficiencyId => {
        const deficiencyNutrient = rootState.deficiency.deficiencyNutrients.find(dn => dn.deficiencyId === deficiencyId);
        console.log('deficiencyNutrient:', deficiencyNutrient);
        if (!deficiencyNutrient) {
          console.error(`No nutrientId found for deficiencyId: ${deficiencyId}`);
          return [];
        }

        const productsForDeficiency = rootState.product.products.filter(product => {
          return product.nutrientId === deficiencyNutrient.nutrientId;
        });
        console.log(`Products for deficiency ID ${deficiencyId}:`, productsForDeficiency);
        return productsForDeficiency.map(product => product.productId);
      });

      // 중복된 값 제거
      recommendedProducts = [...new Set(recommendedProducts)];
      console.log('Recommended Products (unique):', recommendedProducts);

      const uniqueKeywords = Array.from(new Set(detailedDeficiencies)).join(',');
      console.log('Keywords:', uniqueKeywords);

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
        recommendedProducts: recommendedProducts.join(',') || '',
        keywords: uniqueKeywords || ''
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
      console.log('Survey Result Loaded: ', response.data);
      commit('setSurveyResult', response.data.length ? response.data[0] : null);
      return response.data;
    } catch (error) {
      console.error('Failed to load survey result:', error);
      return null;
    }
  },
  async fetchAgeGroupDeficiencyData({ commit, dispatch, state }) { // 추가된 부분
    try {
      // 결핍 데이터를 먼저 가져옵니다.
      await dispatch('fetchDeficiencies');
      const response = await axios.get('/api/surveys/age-group-deficiency');
      const data = response.data;
      // 결핍 ID와 결핍 이름 간의 매핑을 생성합니다.
      const deficiencyMap = state.deficiencies.reduce((map, deficiency) => {
        map[deficiency.deficiencyId] = deficiency.deficiencyName;
        return map;
      }, {});

      console.log('Deficiency Map:', deficiencyMap); // 추가된 로그

      // 결핍 데이터를 결핍 이름으로 매핑합니다.
      const mappedData = data.map(item => { 
        const ageGroup = item[0];
        const deficiencyId = item[1];
        const count = item[2];
        const deficiencyName = deficiencyMap[deficiencyId] || `Unknown (${deficiencyId})`;
        return [ageGroup, deficiencyName, count];
      });

      console.log('Mapped Data:', mappedData); // 추가된 로그

      commit('setAgeGroupDeficiencyData', mappedData);
    } catch (error) {
      console.error('Failed to fetch age group deficiency data:', error);
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
    return state.selectedAnswers[state.surveyQuestions[state.currentQuestionIndex]?.id]?.length > 0;
  },
  isPersonalInfoComplete: (state) => {
    return state.survey.name && 
           state.survey.age && 
           state.survey.gender && 
           state.survey.height && 
           state.survey.weight;
  },
  surveyResult: (state) => state.surveyResult,
  recommendedProducts: (state, getters, rootState) => {
    const productIds = (state.surveyResult?.recommendedProducts || "").split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    console.log('Filtering products with IDs:', productIds);
    console.log('rootState.product.products:', rootState.product.products);
    return rootState.product.products.filter(product => productIds.includes(product.productId));
  },
  ageGroupDeficiencyData: (state) => state.ageGroupDeficiencyData, // 추가된 부분
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
