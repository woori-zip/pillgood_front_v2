import axios from 'axios';

const state = {
  inquiries: [],
  inquiry: null,
  answer: null
};

const getters = {
  allInquiries: state => state.inquiries,
  singleInquiry: state => state.inquiry,
  singleAnswer: state => state.answer
};

const actions = {
  async fetchInquiries({ commit }) {
    try {
      const response = await axios.get('/api/inquiries/list');
      commit('setInquiries', response.data);
    } catch (error) {
      console.error('문의 조회 실패:', error);
    }
  },
  fetchInquiry({ commit }, id) {
    return axios.get(`/api/inquiries/${id}`)
      .then(response => {
        commit('setInquiry', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('문의 조회 실패:', error);
        throw error;
      });
  },
  async fetchInquiriesByMember({ commit }, memberUniqueId) {
    try {
      const response = await axios.get(`/api/inquiries/member/${memberUniqueId}`);
      commit('setInquiries', response.data);
      return response.data;
    } catch (error) {
      console.error('문의 조회 실패:', error);
    }
  },
  async createInquiry({ dispatch }, inquiry) {
    try {
      const response = await axios.post('/api/inquiries/create', inquiry);
      console.log('문의 작성됨', response.data);
      dispatch('fetchInquiries');
    } catch (error) {
      console.error('문의 생성 실패:', error);
    }
  },
  async updateInquiry({ dispatch }, inquiry) {
    try {
      await axios.put(`/api/inquiries/update/${inquiry.inquiryNo}`, inquiry);
      dispatch('fetchInquiry', inquiry.inquiryNo);
    } catch (error) {
      console.error('문의 수정 실패:', error);
    }
  },
  async deleteInquiry({ dispatch }, inquiryNo) {
    try {
      await axios.delete(`/api/inquiries/delete/${inquiryNo}`);
      dispatch('fetchInquiries');
    } catch (error) {
      console.error('문의 삭제 실패:', error);
    }
  },
  fetchAnswer({ commit }, inquiryNo) {
    return axios.get(`/api/answers/${inquiryNo}`)
      .then(response => {
        commit('setAnswer', response.data);
        console.log("fetched answer: " + response.data);
        return response.data;
      })
      .catch(error => {
        console.error('답변 조회 실패:', error);
        commit('setAnswer', null);
        throw error;
      });
  },
  async createAnswer({ dispatch }, answer) {
    try {
      const response = await axios.post('/admin/answers/create', answer);
      console.log("Response from server:", response.data);
      await dispatch('fetchAnswer', answer.inquiry.inquiryNo);
      await dispatch('fetchInquiry', answer.inquiry.inquiryNo); // 문의 상태 업데이트
      return response.data;
    } catch (error) {
      console.error('답변 생성 실패:', error);
      throw error;
    }
  },
  async updateAnswer({ dispatch }, answer) {
    try {
      const response = await axios.put(`/admin/answers/update/${answer.inquiryNo}`, answer);
      await dispatch('fetchAnswer', answer.inquiryNo);
      await dispatch('fetchInquiry', answer.inquiryNo); // 문의 상태 업데이트
      return response.data;
    } catch (error) {
      console.error('답변 수정 실패:', error);
      throw error;
    }
  },
  async deleteAnswer({ dispatch }, answer) {
    try {
      const response = await axios.delete(`/admin/answers/delete/${answer.inquiryNo}`);
      await dispatch('fetchAnswer', answer.inquiry.inquiryNo);
      await dispatch('fetchInquiry', answer.inquiry.inquiryNo); // 문의 상태 업데이트
      return response.data;
    } catch (error) {
      console.error('답변 삭제 실패:', error);
      throw error;
    }
  }
};

const mutations = {
  setInquiries: (state, inquiries) => (state.inquiries = inquiries),
  setInquiry: (state, inquiry) => (state.inquiry = inquiry),
  setAnswer: (state, answer) => (state.answer = answer)
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
