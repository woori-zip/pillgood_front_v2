import axios from '../../axios'; // 설정된 axios 인스턴스 불러오기

const state = {
  notices: [],
  notice: null,
  totalNotices: 0, // 전체 공지사항 개수 추가
  pageSize: 10,
  currentPage: 0 // 현재 페이지 추가
};

const getters = {
  notices: state => state.notices,
  notice: state => state.notice,
  totalNotices: state => state.totalNotices,
  totalPages: state => Math.ceil(state.totalNotices / state.pageSize), // 총 페이지 수 계산
  currentPage: state => state.currentPage // 현재 페이지 getter 추가
};

const actions = {
  // 공지사항 목록 조회
  async fetchNotices({ commit }, { page = 0, size = 10 } = {}) {
    try {
      const response = await axios.get('/api/notices', {
        params: { page, size }
      });
      if (response.status === 200) {
        commit('setNotices', response.data.content);
        commit('setTotalNotices', response.data.totalElements);
        commit('setCurrentPage', page);
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
  
  // 개별 공지사항 조회
  async fetchNotice({ commit }, noticeId) {
    try {
      const response = await axios.get(`/api/notices/${noticeId}`);
      if (response.status === 200) {
        commit('setNotice', response.data);
        console.log('공지사항 개별 조회 성공:', response.data);
        return response; // 데이터를 반환
      } else {
        console.error('공지사항 개별 조회 실패:', response.data);
        throw new Error('공지사항 개별 조회 실패');
      }
    } catch (error) {
      console.error('공지사항 개별 조회 에러:', error);
      throw error;
    }
  },
  
  // 공지사항 생성
  async createNotice({ dispatch }, notice) {
    try {
      const response = await axios.post('/admin/notices/create', notice);
      if (response.status === 201) {
        console.log('공지사항 생성 성공:', response.data);
        dispatch('fetchNotices', { page: state.currentPage, size: state.pageSize }); // 공지사항 목록을 새로고침
      } else {
        console.error('공지사항 생성 실패:', response.data);
        throw new Error('공지사항 생성 실패');
      }
    } catch (error) {
      console.error('공지사항 생성 에러:', error);
      throw error;
    }
  },
  
  // 공지사항 수정
  async updateNotice({ dispatch }, notice) {
    try {
      const response = await axios.put(`/admin/notices/update/${notice.id}`, notice);
      if (response.status === 200) {
        dispatch('fetchNotices', { page: state.currentPage, size: state.pageSize });
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
  
  // 공지사항 삭제
  async deleteNotice({ dispatch }, noticeNo) {
    try {
      const response = await axios.delete(`/admin/notices/delete/${noticeNo}`);
      if (response.status === 204) {
        dispatch('fetchNotices', { page: state.currentPage, size: state.pageSize });
        console.log('공지사항 삭제 성공');
      } else {
        console.error('공지사항 삭제 실패:', response.data);
        throw new Error('공지사항 삭제 실패');
      }
    } catch (error) {
      console.error('공지사항 삭제 에러:', error);
      throw error;
    }
  },
  
  // 공지사항 제목으로 검색
  async searchNoticeByTitle(_, title) {
    try {
      const response = await axios.get(`/api/notices/search?title=${title}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search notice:', error);
      throw error;
    }
  }
};

const mutations = {
  setNotices: (state, notices) => {
    state.notices = notices;
  },
  setNotice: (state, notice) => {
    state.notice = notice;
  },
  setTotalNotices: (state, total) => {
    state.totalNotices = total;
  },
  setCurrentPage: (state, page) => {
    state.currentPage = page;
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
