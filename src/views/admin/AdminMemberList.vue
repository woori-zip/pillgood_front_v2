<template>
  <v-container class="main-container box-shadow">
    <v-card>
      <v-card-title>
        <h1 class="text-melon">회원 목록</h1>
      </v-card-title>

      <v-card-subtitle>
          <v-row text-align="center">
            <v-col cols="12" sm="3">
              <v-select
                v-model="selectedFilter"
                :items="filters"
                item-text="title"
                item-value="value"
                label="필터 선택"
                dense
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="searchQuery"
                :disabled="!selectedFilter"
                label="검색어를 입력하세요"
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="3">
              <v-btn color="primary" @click="resetFilters">초기화</v-btn>
            </v-col>
          </v-row>
      </v-card-subtitle>

      <v-data-table
        :headers="headers"
        :items="filteredMembers"
        class="elevation-1"
      >
        <template v-slot:[`item.gender`]="{ item }">
            <span>{{ genderText(item.gender) }}</span>
        </template>
        <template v-slot:[`item.registrationDate`]="{ item }">
            <span>{{ formatDate(item.registrationDate) }}</span>
        </template>
        <template v-slot:[`item.subscriptionStatus`]="{ item }">
            <span>{{ item.subscriptionStatus ? '구독중' : '-' }}</span>
        </template>
        <template v-slot:[`item.memberLevel`]="{ item }">
            <span>{{ levelText(item.memberLevel) }}</span>
        </template>
        <template v-slot:[`item.coupon`]="{ item }">
          <div v-if="!item.couponIssued" style="display: flex;">
            <v-combobox
              v-model="selectedCoupons[item.memberUniqueId]"
              :items="couponItems"
              item-text="title"
              item-value="value"
              label="-쿠폰 선택-"
              outlined
              dense
            ></v-combobox>
            <v-btn color="success" @click="issueCoupon(item)">발급</v-btn>
          </div>
          <div v-else>발급 완료</div>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn small @click="openEditDialog(item)">수정</v-btn>&nbsp;
          <v-btn color="error" small @click="confirmDeleteMember(item.memberUniqueId)">삭제</v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="editDialog" max-width="600px">
      <AdminMemberEdit :member="editingMember" @save="onMemberSave" @cancel="editDialog = false" />
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import axios from '../../axios'; // axios 인스턴스 가져오기
import AdminMemberEdit from './AdminMemberEdit.vue'; // MemberEdit 컴포넌트 가져오기

export default {
  name: 'AdminMemberList',
  components: { AdminMemberEdit },
  data() {
    return {
      selectedFilter: '',
      searchQuery: '',
      selectedCoupons: {},
      editDialog: false,
      editingMember: null,
      headers: [
        { title: '회원명', value: 'name', align: 'center'},
        { title: '이메일', value: 'email', align: 'center' },
        { title: '휴대폰번호', value: 'phoneNumber', align: 'center' },
        { title: '성별', value: 'gender', align: 'center' },
        { title: '가입일', value: 'registrationDate', align: 'center' },
        { title: '구독상태', value: 'subscriptionStatus', align: 'center' },
        { title: '레벨', value: 'memberLevel', align: 'center' },
        { title: '쿠폰 발급', value: 'coupon', align: 'center' },
        { title: '관리', value: 'actions', align: 'center' },
      ],
      filters: [
        { title: '회원명', value: 'memberName' },
        { title: '이메일', value: 'email' },
      ]
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
    },
    couponItems() {
      console.log('activeCoupons in couponItems:', this.activeCoupons);
      const coupons = this.activeCoupons.map(coupon => ({
        title: coupon.couponName,
        value: coupon.couponId
      }));
      console.log('couponItems:', coupons);
      return coupons;
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
      const selectedCoupon = this.selectedCoupons[member.memberUniqueId];
      const couponId = selectedCoupon ? selectedCoupon.value : null; // 객체가 아닌 값 추출
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
    },
    openEditDialog(member) {
      this.editingMember = { ...member };
      this.editDialog = true;
    },
    onMemberSave() {
      this.editDialog = false;
      this.fetchMembers(); // 데이터 새로고침
    }
  }
};
</script>

<style scoped>
.main-container {
  padding: 20px;
}

.text-melon {
  color: #94b58b;
}

.small-btn {
  margin-right: 5px;
}

.line-table {
  width: 100%;
  border-collapse: collapse;
}

.line-table th, .line-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.line-table th {
  background-color: #f2f2f2;
  text-align: left;
}

.line-table tr:hover {
  background-color: #f1f1f1;
}
</style>
