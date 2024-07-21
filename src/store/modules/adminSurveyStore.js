import axios from '../../axios'; // 설정된 axios 인스턴스 불러오기

const state = {
  questions: [],
  answers: [],
  deficiencies: [],
};

const mutations = {
  setQuestions(state, questions) {
    state.questions = questions;
  },
  setAnswers(state, answers) {
    state.answers = answers;
  },
  addQuestion(state, question) {
    state.questions.push(question);
  },
  updateQuestion(state, updatedQuestion) {
    const index = state.questions.findIndex(q => q.id === updatedQuestion.id);
    if (index !== -1) {
      state.questions.splice(index, 1, updatedQuestion);
    }
  },
  removeQuestion(state, questionId) {
    state.questions = state.questions.filter(q => q.id !== questionId);
  },
  addAnswer(state, answer) {
    state.answers.push(answer);
  },
  updateAnswer(state, updatedAnswer) {
    const index = state.answers.findIndex(a => a.id === updatedAnswer.id);
    if (index !== -1) {
      state.answers.splice(index, 1, updatedAnswer);
    }
  },
  removeAnswer(state, answerId) {
    state.answers = state.answers.filter(a => a.id !== answerId);
  },
  setDeficiencies(state, deficiencies) {
    state.deficiencies = deficiencies;
  },
  addDeficiency(state, deficiency) {
    state.deficiencies.push(deficiency);
  },
  removeDeficiency(state, id) {
    state.deficiencies = state.deficiencies.filter(d => d.deficiencyId !== id);
  }
};

const actions = {
  async fetchQuestions({ commit }) {
    try {
      const response = await axios.get('/api/questions/list');
      commit('setQuestions', response.data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  },
  async createQuestion({ commit }, question) {
    try {
      const response = await axios.post('/admin/questions/create', question);
      commit('addQuestion', response.data);
    } catch (error) {
      console.error('Failed to create question:', error);
      throw error;
    }
  },
  async updateQuestion({ commit }, question) {
    try {
      const response = await axios.put(`/admin/questions/update/${question.id}`, question);
      commit('updateQuestion', response.data);
    } catch (error) {
      console.error('Failed to update question:', error);
      throw error;
    }
  },
  async deleteQuestion({ commit }, questionId) {
    try {
      await axios.delete(`/admin/questions/delete/${questionId}`);
      commit('removeQuestion', questionId);
    } catch (error) {
      console.error('Failed to delete question:', error);
      throw error;
    }
  },
  async fetchAnswers({ commit }, questionId) {
    try {
      const response = await axios.get('/api/surveyanswers/list');
      const answers = response.data.filter(answer => answer.questionId === questionId);
      commit('setAnswers', answers);
    } catch (error) {
      console.error('Failed to fetch answers:', error);
    }
  },
  async createAnswer({ commit }, answer) {
    try {
      const response = await axios.post('/admin/surveyanswers/create', answer);
      commit('addAnswer', response.data);
    } catch (error) {
      console.error('Failed to create answer:', error);
      throw error;
    }
  },
  async updateAnswer({ commit }, answer) {
    try {
      const response = await axios.put(`/admin/surveyanswers/update/${answer.id}`, answer);
      commit('updateAnswer', response.data);
    } catch (error) {
      console.error('Failed to update answer:', error);
      throw error;
    }
  },
  async deleteAnswer({ commit }, answerId) {
    try {
      await axios.delete(`/admin/surveyanswers/delete/${answerId}`);
      commit('removeAnswer', answerId);
    } catch (error) {
      console.error('Failed to delete answer:', error);
      throw error;
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
  async createDeficiency({ commit }, deficiency) {
    try {
      const response = await axios.post('/admin/deficiencies/create', deficiency);
      if (response.status === 200) {
        commit('addDeficiency', response.data);
      } else {
        throw new Error('Failed to create deficiency');
      }
    } catch (error) {
      console.error('Error creating deficiency:', error);
      throw error;
    }
  },
  async deleteDeficiency({ commit }, id) {
    try {
      const response = await axios.delete(`/admin/deficiencies/delete/${id}`);
      if (response.status === 200) {
        commit('removeDeficiency', id);
      } else {
        throw new Error('Failed to delete deficiency');
      }
    } catch (error) {
      console.error('Error deleting deficiency:', error);
      throw error;
    }
  }
};

const getters = {
  allQuestions: (state) => state.questions,
  answersByQuestion: (state) => (questionId) => {
    return state.answers.filter(answer => answer.questionId === questionId);
  },
  deficiencies: state => state.deficiencies,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
