import axios from '../../axios'; // 설정된 axios 인스턴스 불러오기

const state = {
  isLoggedIn: localStorage.getItem('loggedIn') === 'true', // 로컬스토리지 
  memberId: localStorage.getItem('memberId'), // 로컬 스토리지에서 memberId 저장--review에서 쓰임
  member: null, // 사용자 정보를 저장
  isAdmin: localStorage.getItem('isAdmin') === 'true', // 관리자 여부를 저장
  members: [], // 회원 목록을 저장
  editingMember: null, // 현재 수정 중인 회원 정보를 저장
  rememberedEmail: localStorage.getItem('rememberedEmail') || '' // 이메일 기억하기
};

const mutations = {
  setLoginState(state, payload) {
    state.isLoggedIn = payload.isLoggedIn;
    state.memberId = payload.memberId;
    state.member = payload.member;
    state.isAdmin = payload.isAdmin || false;
    localStorage.setItem('loggedIn', payload.isLoggedIn);
    localStorage.setItem('memberId', payload.memberId); // 로컬 스토리지에 memberId를 저장--review에서 쓰임
    localStorage.setItem('isAdmin', payload.isAdmin.toString()); // isAdmin을 문자열로 변환하여 저장
  },
  setRememberedEmail(state, email) {
    state.rememberedEmail = email;
    localStorage.setItem('rememberedEmail', email);
  },
  setMembers(state, members) {
    // 서버에서 받은 members 데이터를 memberId로 변환
    state.members = members.map(member => ({
      ...member,
      memberId: member.memberUniqueId
    }));
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
  },
  setUser(state, user) {
    state.member = user;
  }
};

const actions = {
  async login({ commit }, { email, password }) {
    try {
      const response = await axios.post('/api/members/login', { email, password }, { withCredentials: true });
      if (response.status === 200) {
        console.log('로그인 응답 데이터: ', response.data); // 응답 데이터 확인
        // 로그인 후 사용자 정보 가져오기
        const memberResponse = await axios.get(`/api/members/findById`, { withCredentials: true });
        if (memberResponse.status === 200) {
          const member = memberResponse.data.user;
          const memberId = member.memberUniqueId;
          const isAdmin = member.memberLevel === 'ADMIN';

          // Vuex 상태 업데이트
          commit('setLoginState', { isLoggedIn: true, memberId, member, isAdmin });

          // 로컬스토리지에 사용자 정보 저장
          localStorage.setItem('member', JSON.stringify(member));
          localStorage.setItem('isAdmin', isAdmin.toString());
          localStorage.setItem('userName', member.name);
        }
      }
    } catch (error) {
      console.error('axios 로그인 에러: ', error);
    }
  },
  async kakaoLogin({ commit }, { code }) {
    try {
      const response = await axios.post('/api/members/kakaoLogin', { code });
      if (response.data.success) {
        const memberId = response.data.memberId;
        localStorage.setItem('loggedIn', true);
        localStorage.setItem('memberId', memberId);

        // 로그인 후 사용자 정보 가져오기
        const memberResponse = await axios.get(`/api/members/findById`, { withCredentials: true });
        if (memberResponse.status === 200) {
          const member = memberResponse.data.user;
          const isAdmin = member.memberLevel === 'ADMIN';

          // Vuex 상태 업데이트
          commit('setLoginState', { isLoggedIn: true, memberId, member, isAdmin });

          // 로컬스토리지에 사용자 정보 저장
          localStorage.setItem('member', JSON.stringify(member));
          localStorage.setItem('isAdmin', isAdmin.toString());
          localStorage.setItem('userName', member.name);
        }
      }
    } catch (error) {
      console.error('axios 카카오 로그인 에러: ', error);
    }
  },
  async fetchMemberInfo({ state, commit }, memberId) {
    try {
      memberId = memberId || state.memberId;
      const response = await axios.get(`/api/members/findById`, { params: { memberId }, withCredentials: true });
      if (response.status === 200) {
        const member = response.data.user;
        const isAdmin = member.memberLevel === 'ADMIN'; // 관리자 여부 확인
        commit('setLoginState', { isLoggedIn: true, memberId: member.memberUniqueId, member, isAdmin });
      }  else {
        commit('setLoginState', { isLoggedIn: false, memberId: null, member: null, isAdmin: false });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      commit('setLoginState', { isLoggedIn: false, memberId: null, member: null, isAdmin: false });
    }
  },
  async logout({ commit }) {
    try {
      // 기억된 이메일을 임시 변수에 저장
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      
      // 로그아웃 요청
      await axios.post('/logout', {}, { withCredentials: true }); // 스프링 시큐리티의 기본 로그아웃 URL로 요청
      console.log("로그아웃 요청 완료");
      
      // 상태 초기화
      commit('setLoginState', { isLoggedIn: false, memberId: null, member: null, isAdmin: false });
      
      // 전체 로컬 스토리지 초기화
      localStorage.clear();
      
      // 기억된 이메일이 있으면 로컬 스토리지에 다시 저장
      if (rememberedEmail) {
        localStorage.setItem('rememberedEmail', rememberedEmail);
      }
      
      console.log("로그아웃 후 로컬 스토리지 상태: ", localStorage.getItem('loggedIn'));
      console.log("로그아웃 후 쿠키 상태: ", document.cookie);
      
    } catch (error) {
      console.error('로그아웃 에러: ', error);
    }
  },
  async fetchMembers({ commit }) { // 회원 리스트 조회
    try {
      const response = await axios.get('/admin/members/list');
      if (response.status === 200) {
        commit('setMembers', response.data);
      }
    } catch (error) {
      console.error('회원 목록을 불러오는 데 실패했습니다: ', error);
    }
  },
  async deleteMember({ commit }, memberId) { // 회원 삭제
    try {
      const response = await axios.delete(`/admin/members/delete/${memberId}`);
      console.log('회원 삭제 응답', response)
      if (response.status === 200) {
        commit('removeMember', memberId);
      }
    } catch (error) {
      console.error('회원 삭제에 실패했습니다: ', error);
    }
  },
  async updateMember({ commit }, updatedMember) { // 회원 정보 업데이트
    try {
      const updatedMemberWithUniqueId = { ...updatedMember, memberUniqueId: updatedMember.memberId };
      delete updatedMemberWithUniqueId.memberId;

      const response = await axios.put(`/api/members/update/${updatedMember.memberId}`, updatedMemberWithUniqueId);
      if (response.status === 200) {
        commit('updateMember', updatedMember);
      }
    } catch (error) {
      console.error('회원 업데이트에 실패했습니다: ', error);
    }
  },
  setEditingMember({ commit }, member) {
    commit('setEditingMember', member);
  },
  async fetchUserProfile({ commit }) {
    try {
      const response = await axios.get('/api/members/mypage', { withCredentials: true });
      console.log('마이페이지 서버 응답: ', response)
      if (response.status === 200) {
        commit('setUser', response.data);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }
};

const getters = {
  members: state => state.members,
  isAdmin: state => state.isAdmin,
  editingMember: state => state.editingMember,
  memberId: state => state.memberId, // memberId getter 추가--review에서 쓰임
  member: state => state.member
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
