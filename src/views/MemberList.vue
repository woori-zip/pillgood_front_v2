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
          <th>쿠폰 발급</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in filteredMembers" :key="member.memberUniqueId">
          <td>{{ member.name }}</td>
          <td>{{ member.email }}</td>
          <td>{{ member.phoneNumber }}</td>
          <td>{{ genderText(member.gender) }}</td>
          <td>{{ formatDate(member.registrationDate) }}</td>
          <td>{{ member.subscriptionStatus ? '구독중' : '-' }}</td>
          <td>{{ levelText(member.memberLevel) }}</td>
          <td>
            <div v-if="!member.couponIssued">
              <select v-model="selectedCoupons[member.memberUniqueId]">
                <option value="" disabled>-쿠폰 선택-</option>
                <option v-for="coupon in activeCoupons" :key="coupon.couponId" :value="coupon.couponId">{{ coupon.couponName }}</option>
              </select>
              <button @click="issueCoupon(member)">발급</button>
            </div>
            <div v-else>
              발급 완료
            </div>
          </td>
          <td>
            <button class="small-btn" @click="editMember(member)">수정</button>
            <button class="small-btn" @click="confirmDeleteMember(member.memberUniqueId)">삭제</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import axios from '../axios'; // axios 인스턴스 가져오기

export default {
  name: 'MemberList',
  data() {
    return {
      selectedFilter: '',
      searchQuery: '',
      selectedCoupons: {}
    };
  },
  computed: {
    ...mapGetters('member', ['members']),
    ...mapGetters('coupon', ['activeCoupons']),
    filteredMembers() {
      let members = this.members;

      if (this.selectedFilter && this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        members = members.filter(member => {
          if (this.selectedFilter === 'memberName') {
            return member.name && member.name.toLowerCase().includes(query);
          } else if (this.selectedFilter === 'email') {
            return member.email && member.email.toLowerCase().includes(query);
          }
          return true;
        });
      }

      return members.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
    }
  },
  async created() {
    await this.checkLoginStatus();
    await this.fetchMembers();
    await this.fetchActiveCoupons();
  },
  methods: {
    ...mapActions('member', {
      checkLoginStatus: 'checkLoginStatus',
      fetchMembers: 'fetchMembers',
      deleteMemberFromStore: 'deleteMember',
      setEditingMember: 'setEditingMember'
    }),
    ...mapActions('coupon', ['fetchActiveCoupons']),
    formatDate(date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    resetFilters() {
      this.selectedFilter = '';
      this.searchQuery = '';
    },
    editMember(member) {
      this.setEditingMember(member);
      this.$router.push('/memberedit');
    },
    async confirmDeleteMember(memberId) {
      if (confirm('정말로 이 회원을 삭제하시겠습니까?')) {
        await this.deleteMemberFromStore(memberId);
        await this.fetchMembers();
      }
    },
    genderText(gender) {
      if (gender === 'F') return '여성';
      if (gender === 'M') return '남성';
      return '알 수 없음';
    },
    levelText(memberLevel) {
      if (memberLevel === 'ADMIN') return '관리자';
      if (memberLevel === 'USER') return '-';
    },
    async issueCoupon(member) {
      const couponId = this.selectedCoupons[member.memberUniqueId];
      if (!couponId) {
        alert('쿠폰을 선택해주세요.');
        return;
      }

      const ownedCoupon = {
        memberUniqueId: member.memberUniqueId,
        couponId,
        issuedDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        couponUsed: false
      };
      console.log('발급 요청 데이터:', ownedCoupon); // 요청 데이터 확인용 로그

      try {
        await axios.post('/admin/ownedcoupons/create', ownedCoupon);
        await axios.put(`/api/members/updateCouponIssued/${member.memberUniqueId}`, { couponIssued: true });
        member.couponIssued = true;
        this.$forceUpdate(); // 뷰 업데이트 강제 적용
        alert('쿠폰이 발급되었습니다.');
      } catch (error) {
        console.error('쿠폰 발급 실패:', error);
        alert('쿠폰 발급에 실패했습니다.');
      }
    }
  }
};
</script>
