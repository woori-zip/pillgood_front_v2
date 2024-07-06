import axios from 'axios';

const state = {
  inquiries: [],
  inquiry: null
};

const getters = {
  allInquiries: state => state.inquiries,
  singleInquiry: state => state.inquiry
};

const actions = {
  async fetchInquiries({ commit }) {
    try {
      const response = await axios.get('/api/inquiries/list');
      if (response.status === 200) {
        commit('setInquiries', response.data);
        console.log('문의 조회 성공:', response.data);
      } else {
        console.error('문의 조회 실패:', response.data);
        throw new Error('문의 조회 실패');
      }
    } catch (error) {
      console.error('문의 조회 에러:', error);
      throw error;
    }
  },
  async createInquiry({ dispatch }, inquiry) {
    try {
      console.log('Sending inquiry data:', inquiry); // 디버깅용 로그
      const response = await axios.post('/api/inquiries/create', inquiry);
      if (response.status === 200) {
        console.log('문의 생성 성공:', response.data);
        dispatch('fetchInquiries'); // 문의 목록을 새로고침
      } else {
        console.error('문의 생성 실패:', response.data);
        throw new Error('문의 생성 실패');
      }
    } catch (error) {
      console.error('문의 생성 에러:', error);
      throw error;
    }
  },
  async updateInquiry({ dispatch }, inquiry) {
    try {
      const response = await axios.put(`/api/inquiries/update/${inquiry.id}`, inquiry);
      if (response.status === 200) {
        dispatch('fetchInquiries');
        console.log('문의 수정 성공:', response.data);
      } else {
        console.error('문의 수정 실패:', response.data);
        throw new Error('문의 수정 실패');
      }
    } catch (error) {
      console.error('문의 수정 에러:', error);
      throw error;
    }
  },
  async deleteInquiry({ dispatch }, inquiryNo) {
    try {
      const response = await axios.delete(`/api/inquiries/delete/${inquiryNo}`);
      if (response.status === 204) {
        dispatch('fetchInquiries');
        console.log('문의 삭제 성공');
      } else {
        console.error('문의 삭제 실패:', response.data);
        throw new Error('문의 삭제 실패');
      }
    } catch (error) {
      console.error('문의 삭제 에러:', error);
      throw error;
    }
  }
};

const mutations = {
  setInquiries: (state, inquiries) => {
    state.inquiries = inquiries;
  },
  addInquiry: (state, inquiry) => {
    state.inquiries.push(inquiry);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
