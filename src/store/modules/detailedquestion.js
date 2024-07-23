import axios from '../../axios'; // 설정된 axios 인스턴스 불러오기

const state = {
  detailedQuestions: [],
};

const mutations = {
  setDetailedQuestions(state, detailedQuestions) {
    state.detailedQuestions = detailedQuestions;
  },
  addDetailedQuestion(state, detailedQuestion) {
    state.detailedQuestions.push(detailedQuestion);
  },
  updateDetailedQuestion(state, updatedQuestion) {
    const index = state.detailedQuestions.findIndex(q => q.detailedQuestionId === updatedQuestion.detailedQuestionId);
    if (index !== -1) {
      state.detailedQuestions.splice(index, 1, updatedQuestion);
    }
  },
  removeDetailedQuestion(state, id) {
    state.detailedQuestions = state.detailedQuestions.filter(q => q.detailedQuestionId !== id);
  }
};

const actions = {
  async fetchDetailedQuestions({ commit }) {
    try {
      const response = await axios.get('/api/detailed-questions/list');
      commit('setDetailedQuestions', response.data);
    } catch (error) {
      console.error('Error fetching detailed questions:', error);
    }
  },
  async createDetailedQuestion({ commit }, detailedQuestion) {
    try {
      const response = await axios.post('/admin/detailed-questions/create', detailedQuestion);
      if (response.status === 200) {
        commit('addDetailedQuestion', response.data);
      } else {
        throw new Error('Failed to create detailed question');
      }
    } catch (error) {
      console.error('Error creating detailed question:', error);
      throw error;
    }
  },
  async updateDetailedQuestion({ commit }, detailedQuestion) {
    try {
      const response = await axios.put(`/admin/detailed-questions/update/${detailedQuestion.detailedQuestionId}`, detailedQuestion);
      if (response.status === 200) {
        commit('updateDetailedQuestion', response.data);
      } else {
        throw new Error('Failed to update detailed question');
      }
    } catch (error) {
      console.error('Error updating detailed question:', error);
      throw error;
    }
  },
  async deleteDetailedQuestion({ commit }, id) {
    try {
      const response = await axios.delete(`/admin/detailed-questions/delete/${id}`);
      console.log('업데이트 서버 응답', response)
      if (response.status === 200) {
        commit('removeDetailedQuestion', id);
      } else {
        throw new Error('Failed to delete detailed question');
      }
    } catch (error) {
      console.error('Error deleting detailed question:', error);
      throw error;
    }
  }
};

const getters = {
  allQuestions: state => state.detailedQuestions
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
