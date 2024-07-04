import axios from '../../axios'; // 설정된 axios 인스턴스 불러오기

const state = {
  notices: []
};

const getters = {
  notices: state => state.notices
};

const actions = {
  async fetchNotices({ commit }) {
    try {
      const response = await axios.get('/admin/notices/list');
      if (response.status === 200) {
        commit('setNotices', response.data);
        console.log('공지사항 조회 성공:', response.data);
      } else {
        console.error('공지사항 조회 실패:', response.data);
        throw new Error('공지사항 조회 실패');
      }
    } catch (error) {
      console.error('공지사항 조회 에러:', error);
      throw error;
    }
  },
  async createNotice({ dispatch }, notice) {
    try {
      const response = await axios.post('/admin/notices/create', notice);
      if (response.status === 201) {
        console.log('공지사항 생성 성공:', response.data);
        dispatch('fetchNotices'); // 공지사항 목록을 새로고침
      } else {
        console.error('공지사항 생성 실패:', response.data);
        throw new Error('공지사항 생성 실패');
      }
    } catch (error) {
      console.error('공지사항 생성 에러:', error);
      throw error;
    }
  },
  async updateNotice({ dispatch }, notice) {
    try {
      const response = await axios.put(`/admin/notices/update/${notice.id}`, notice);
      if (response.status === 200) {
        dispatch('fetchNotices');
        console.log('공지사항 수정 성공:', response.data);
      } else {
        console.error('공지사항 수정 실패:', response.data);
        throw new Error('공지사항 수정 실패');
      }
    } catch (error) {
      console.error('공지사항 수정 에러:', error);
      throw error;
    }
  },
  async deleteNotice({ dispatch }, noticeNo) {
    try {
      const response = await axios.delete(`/admin/notices/delete/${noticeNo}`);
      if (response.status === 204) {
        dispatch('fetchNotices');
        console.log('공지사항 삭제 성공');
      } else {
        console.error('공지사항 삭제 실패:', response.data);
        throw new Error('공지사항 삭제 실패');
      }
    } catch (error) {
      console.error('공지사항 삭제 에러:', error);
      throw error;
    }
  }
};

const mutations = {
  setNotices: (state, notices) => {
    state.notices = notices;
  },
  addNotice: (state, notice) => {
    state.notices.push(notice);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
