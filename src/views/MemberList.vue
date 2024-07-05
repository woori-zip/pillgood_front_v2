<template>
  <div class="main-container box-shadow">
    <h1 class="text-melon">회원 목록</h1>
    <div style="display: flex; align-items: center">
      <select style="width:150px;" v-model="selectedFilter">
        <option value="">- 선택 -</option>
        <option value="memberName">회원명</option>
        <option value="email">이메일</option>
      </select>
      <input v-model="searchQuery" :disabled="!selectedFilter" placeholder="검색어를 입력하세요">
      <button class="small-btn" @click="resetFilters">초기화</button>
    </div>
    <table class="line-table member-table">
      <thead>
        <tr>
          <th>회원명</th>
          <th>이메일</th>
          <th>휴대폰번호</th>
          <th>성별</th>
          <th>가입일</th>
          <th>구독상태</th>
          <th>레벨</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in filteredMembers" :key="member.memberId">
          <td>{{ member.name }}</td>
          <td>{{ member.email }}</td>
          <td>{{ member.phoneNumber }}</td>
          <td>{{ genderText(member.gender) }}</td>
          <td >{{ formatDate(member.registrationDate) }}</td>
          <td>{{ member.subscriptionStatus ? '구독중' : '-' }}</td>
          <td>{{ levelText(member.memberLevel) }}</td>
          <td>
            <button class="small-btn" @click="editMember(member)">수정</button>
            <button class="small-btn" @click="confirmDeleteMember(member.memberId)">삭제</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'MemberList',
  data() {
    return {
      selectedFilter: '',
      searchQuery: ''
    };
  },
  computed: {
    ...mapGetters('member', ['members']),
    // 회원 검색
    filteredMembers() {
      if (!this.selectedFilter && !this.searchQuery) {
        return this.members; // 여기서 mapGetters로 가져온 members를 사용
      }

      const query = this.searchQuery.toLowerCase();

      return this.members.filter(member => {
        if (this.selectedFilter === 'memberName') {
          return member.name && member.name.toLowerCase().includes(query);
        } else if (this.selectedFilter === 'email') {
          return member.email && member.email.toLowerCase().includes(query);
        }
        return true;
      });
    }
  },
  async created() {
    await this.checkLoginStatus();
    await this.fetchMembers();
  },
  methods: {
    ...mapActions('member', {
      checkLoginStatus: 'checkLoginStatus',
      fetchMembers: 'fetchMembers',
      deleteMemberFromStore: 'deleteMember',
      setEditingMember: 'setEditingMember'  // Vuex 액션 추가
    }),
    formatDate(date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    resetFilters() {
      this.selectedFilter = '';
      this.searchQuery = '';
    },
    editMember(member) {
      console.log('MemberList에서 넘기는 memberId:', member.memberId);  // 콘솔 로그 추가
      this.setEditingMember(member);  // Vuex 상태에 회원 정보 저장
      this.$router.push('/memberedit');
    },
    async confirmDeleteMember(memberId) {
      if (confirm('정말로 이 회원을 삭제하시겠습니까?')) {
        await this.deleteMemberFromStore(memberId);
        await this.fetchMembers(); // 삭제 후 회원 목록 갱신
      }
    },
    genderText(gender) {
      if (gender === 'F') return '여성';
      if (gender === 'M') return '남성';
      return '알 수 없음'; // gender 값이 F나 M이 아닌 경우
    },
    levelText(memberLevel) {
      if (memberLevel === 'ADMIN') return '관리자';
      if (memberLevel === 'USER') return '-';
    }
  }
};
</script>
