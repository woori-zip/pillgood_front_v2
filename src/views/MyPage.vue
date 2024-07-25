<template>
  <div class="main-container">
    <h2 class="text-melon">마이 페이지</h2>
    <!-- mypage nav bar -->
    <div class="btn-container">
      <table class="table-borderless">
        <tr>
        <td><button @click="checkSurveyResult" class="btn-link">나의 건강 분석</button></td>
        <td><router-link to="/mysubscriptions" class="btn-link">나의 구독</router-link></td>
        <td><router-link to="/mypoints" class="btn-link">나의 포인트</router-link></td>
        <td><router-link to="/mycoupon" class="btn-link">보유 쿠폰</router-link></td>
        </tr>
        <tr>
        <td><router-link to="/order-history" class="btn-link">주문 | 배송</router-link></td>
        <td><router-link to="/reviewlist" class="btn-link">나의 후기</router-link></td>
        <td><router-link to="/myinquiries" class="btn-link">1:1 문의</router-link></td>
        <td><router-link to="/myaddress" class="btn-link">배송지 관리</router-link></td>
        </tr>
      </table>
    </div>
    <div class="box-container-no-shade">
      <div>
        <div v-if="user">
          <table class="mypage">
            <tr>
              <td><label for="email">이메일 </label></td>
              <td><input type="email" v-model="user.email" :readonly="!isEditing"/></td>
            </tr>
            <tr>
              <td><label for="name">이름 </label></td>
              <td><input type="text" v-model="user.name" :readonly="!isEditing"/></td>
            </tr>
            <tr>
              <td><label for="age">나이 </label></td>
              <td><input type="text" :value="user.age" readonly/></td>
            </tr>
            <tr>
              <td><label for="gender">성별 </label></td>
              <td>
                <select v-model="user.gender" v-if="isEditing" required>
                  <option value="N">성별을 선택하세요</option>
                  <option value="M">남자</option>
                  <option value="F">여자</option>
                </select>
                <input type="text" :value="user.gender" v-else readonly/>
              </td>
            </tr>
            <tr>
              <td><label for="phoneNumber">전화번호 </label></td>
              <td><input type="text" v-model="user.phoneNumber" :readonly="!isEditing"/></td>
            </tr>
            <tr>
              <td><label for="subscriptionStatus">구독 상태 </label></td>
              <td><input type="text" :value="subscriptionStatusText" readonly/></td>
            </tr>
            <tr>
              <td><label for="registrationDate">가입 일자 </label></td>
              <td><input type="text" :value="formatDate(user.registrationDate)" readonly/></td>
            </tr>
            <tr>
              <td>보유 포인트 </td>
              <td><input type="text" readonly :value="totalPoints"></td>
            </tr>
          </table>
          <div class="btn-container">
            <button v-if="!isEditing" class="btn btn-green" @click="showPasswordPrompt">수정하기</button>
            <button v-else class="btn btn-green" @click="updateMember">저장하기</button>
            <button v-if="isEditing" class="btn btn-gray" @click="cancelEdit">취소</button>
          </div>
        </div>
        <div v-else>
          <p>Loading...</p>
        </div>
      </div>
    </div>

    <!-- 비밀번호 확인 모달창 -->
    <div v-if="showPasswordModal" class="modal">
      <div class="box-container box-shadow">
        <h4 class="text-melon">비밀번호 확인</h4>
        <input type="password" v-model="password" placeholder="비밀번호를 입력하세요" />
        <div class="btn-container">
          <button class="btn btn-green" @click="verifyPassword">비밀번호 확인</button>
          <button class="btn btn-gray" @click="closePasswordModal">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '../axios';
import { useRouter } from 'vue-router';
import { mapState, mapActions, useStore } from 'vuex';
import '../assets/styles.css';

export default {
  name: 'MyPage',
  setup() {
    const store = useStore();
    const router = useRouter();

    const checkSurveyResult = async () => {
      try {
        const memberId = store.state.member.memberId;
        const response = await axios.get(`/api/surveys/member/${memberId}`);
        
        if (response.data && response.data.length > 0) {
          router.push({ name: 'SurveyResult', params: { memberId } });
        } else {
          alert('건강 분석 결과를 찾을 수 없습니다');
          router.push({ name: 'Survey' });
        }
      } catch (error) {
        console.error('Failed to fetch survey result:', error);
        alert('설문 결과를 불러오는 중 오류가 발생했습니다.');
        router.push({ name: 'Survey' });
      }
    };

    return {
      store,
      checkSurveyResult
    };
  },
  data() {
    return {
      isEditing: false,
      password: '',
      showPasswordModal: false,
      errors: {},
      totalPoints: 0
    };
  },
  computed: {
    ...mapState('member', ['member']),
    user() {
      return this.member;
    },
    subscriptionStatusText() {
      return this.user.subscriptionStatus ? '구독 중' : '해당 사항 없음';
    },
    memberId() {
    return this.user.memberId;
  }
  },
  created() {
    this.fetchUserProfile();
    this.fetchTotalPoints();
    this.checkAndUpdateSubscriptionStatus(); // 구독 상태 확인 및 업데이트 추가
  },
  methods: {
    ...mapActions('member', ['fetchUserProfile']),
    formatPoints(points) {
    return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    ...mapActions('subscriptions', ['fetchSubscriptions']),
    async checkAndUpdateSubscriptionStatus() {
      const memberId = this.$store.state.member.memberId;
      await this.fetchSubscriptions(memberId);
      const subscriptions = this.$store.state.subscriptions.subscriptions;
      const hasActiveSubscription = subscriptions.some(sub => sub.subscriptionStatus === 'T');

      try {
        await axios.put(`/api/members/updateSubscriptionStatus/${memberId}`, { status: hasActiveSubscription ? 1 : 0 });
        this.fetchUserProfile(); // 사용자 프로필 갱신
      } catch (error) {
        console.error('Failed to update subscription status:', error);
      }
    },
    async fetchTotalPoints() {
      try {
        const response = await axios.get('/api/points/totalPoints', { withCredentials: true });
        this.totalPoints = this.formatPoints(response.data);
      } catch (error) {
        console.error('Error fetching total points:', error);
      }
    },
    toggleEdit() {
      this.isEditing = !this.isEditing;
    },
    showPasswordPrompt() {
      this.password='';
      this.showPasswordModal = true;
    },
    closePasswordModal() {
      this.showPasswordModal = false;
    },
    async verifyPassword() {
      try {
        const verifyResponse = await axios.post('/api/members/verifyPassword', {
          memberId: this.user.memberUniqueId,
          password: this.password,
        });
        if (verifyResponse.status === 200) {
          this.isEditing = true;
          this.showPasswordModal = false;
        } else {
          alert('비밀번호가 일치하지 않습니다.');
        }
      } catch (error) {
        console.error('Error verifying password:', error);
        alert('비밀번호 확인에 실패했습니다.');
      }
    },
    async updateMember() {
      try {
        const response = await axios.put(`/api/members/update/${this.user.memberUniqueId}`, this.user);
        if (response.status === 200) {
          this.user = response.data;
          this.isEditing = false;
          alert('회원 정보가 성공적으로 수정되었습니다.');
        } else {
          console.error('Failed to update member information');
        }
      } catch (error) {
        console.error('Error updating member information:', error);
        alert('회원 정보 수정에 실패했습니다.');
      }
    },
    cancelEdit() {
      this.isEditing = false;
      this.fetchUserProfile();
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toISOString().split('T')[0];
    }
  }
};
</script>

<style>
.btn-link {
  padding: 5px 10px 5px 10px;
  border: none;
  border-radius: 20px;
  background-color: #C6EDC2;
  text-decoration-line: none;
  color: black;
  font-size: 15px;
}

.mypage input[readonly],
.mypage select[readonly] {
  text-align: right;
}

.modal {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0,0,0);
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fefefe;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
  border-radius: 10px;
  text-align: center;
}
</style>
