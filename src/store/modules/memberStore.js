import axios from '../../axios'; // 설정된 axios 인스턴스 불러오기

const state = {
  isLoggedIn: false,
  memberId: null, // 사용자 ID를 저장할 상태
  member: null, // 사용자 정보를 저장할 상태
  isAdmin: false, // 관리자 여부를 저장할 상태
  members: [], // 회원 목록을 저장할 상태
  editingMember: null // 현재 수정 중인 회원 정보를 저장할 상태
};

const mutations = {
  setLoginState(state, payload) {
    state.isLoggedIn = payload.isLoggedIn;
    state.memberId = payload.memberId;
    state.member = payload.member;
    state.isAdmin = payload.isAdmin || false;
  },
  setMembers(state, members) {
    // 서버에서 받은 members 데이터를 memberId로 변환
    console.log('서버에서 받은 members:', members); // 추가
    state.members = members.map(member => {
      const newMember = {
        ...member,
        memberId: member.memberUniqueId
      };
      console.log('변환된 member:', newMember); // 추가
      return newMember;
    });
  },
  removeMember(state, memberId) {
    state.members = state.members.filter(member => member.memberId !== memberId);
  },
  setEditingMember(state, member) {
    state.editingMember = member;
  },
  updateMember(state, updatedMember) {
    const index = state.members.findIndex(member => member.memberId === updatedMember.memberId);
    if (index !== -1) {
      state.members.splice(index, 1, updatedMember);
    }
  }
};

const actions = {
  async login({ commit, dispatch }, { email, password }) {
    try {
      const response = await axios.post('/api/members/login', { email, password });
      if (response.status === 200) {
        const memberId = response.data.memberId;
        localStorage.setItem('loggedIn', true);
        commit('setLoginState', { isLoggedIn: true, memberId });
        // 로그인 후 사용자 정보 가져오기
        await dispatch('fetchMemberInfo', memberId);
      }
    } catch (error) {
      console.error('axios 로그인 에러: ', error);
    }
  },
  async fetchMemberInfo({ state, commit }, memberId) {
    try {
      memberId = memberId || state.memberId;
      const response = await axios.get(`/api/members/findById`, { params: { memberId } });
      if (response.status === 200) {
        const member = response.data.user;
        const isAdmin = member.memberLevel === 'ADMIN'; // 관리자 여부 확인
        commit('setLoginState', { isLoggedIn: true, memberId: memberId, member: member, isAdmin: isAdmin });
      } else {
        commit('setLoginState', { isLoggedIn: false, memberId: null, member: null, isAdmin: false });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      commit('setLoginState', { isLoggedIn: false, memberId: null, member: null, isAdmin: false });
    }
  },
  async checkLoginStatus({ commit, dispatch }) {
    try {
      const response = await axios.get('/api/members/check-session', { withCredentials: true });
      if (response.status === 200) {
        const memberId = response.data.user.memberUniqueId;
        await dispatch('fetchMemberInfo', memberId);
      } else {
        commit('setLoginState', { isLoggedIn: false, memberId: null, member: null });
      }
    } catch (error) {
      commit('setLoginState', { isLoggedIn: false, memberId: null, member: null });
    }
  },
  async logout({ commit }) {
    try {
      await axios.post('/api/members/logout', {}, { withCredentials: true });
      commit('setLoginState', { isLoggedIn: false, memberId: null, member: null, isAdmin: false });
      localStorage.removeItem('loggedIn');
    } catch (error) {
      console.error('로그아웃 에러: ', error);
    }
  },
  async fetchMembers({ commit }) {
    try {
      const response = await axios.get('/admin/members/list');
      if (response.status === 200) {
        console.log('회원목록 데이터:', response.data);
        commit('setMembers', response.data);
      }
    } catch (error) {
      console.error('회원 목록을 불러오는 데 실패했습니다: ', error);
    }
  },
  async deleteMember({ commit }, memberId) {
    try {
      const response = await axios.delete(`/admin/members/delete/${memberId}`);
      if (response.status === 200) {
        commit('removeMember', memberId);
      }
    } catch (error) {
      console.error('회원 삭제에 실패했습니다: ', error);
    }
  },
  async updateMember({ commit }, updatedMember) {
    try {
      // 서버로 전송하기 전에 memberId를 memberUniqueId로 변환
      const updatedMemberWithUniqueId = { ...updatedMember, memberUniqueId: updatedMember.memberId };
      delete updatedMemberWithUniqueId.memberId;

      console.log('서버로 전송하기 전 memberId:', updatedMember.memberId);
      console.log('서버로 전송할 데이터:', updatedMemberWithUniqueId);

      const response = await axios.put(`/api/members/update/${updatedMember.memberId}`, updatedMemberWithUniqueId);
      if (response.status === 200) {
        console.log('수정된 멤버 정보:', updatedMember);
        commit('updateMember', updatedMember);
      }
    } catch (error) {
      console.error('회원 업데이트에 실패했습니다: ', error);
    }
  },
  setEditingMember({ commit }, member) {
    commit('setEditingMember', member);
  }
};
const getters = {
  members: state => state.members,
  isAdmin: state => state.isAdmin,
  editingMember: state => state.editingMember
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
