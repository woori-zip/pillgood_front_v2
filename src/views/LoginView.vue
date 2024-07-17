<template>
  <div class="main-container">
  <div class="box-container-no-shade">
    <h4 class="text-melon">로그인</h4>
    <!-- 기존 로그인 폼 -->
    <form @submit.prevent="handleLogin">
      <table>
        <tr>
          <td><label for="email" class="text-melon">이메일</label></td>
          <td><input type="email" id="email" v-model="email" required /></td>
        </tr>
        <tr>
          <td><label for="password" class="text-melon">비밀번호</label></td>
          <td><input type="password" id="password" v-model="password" required /></td>
        </tr>
      </table>
      <div class="check-container">
        <input id="chk_all" type="checkbox" v-model="rememberEmail">
        <label for="chk_all" class="text-gray">이메일 기억하기</label>
      </div>
      <router-link to="/forgotpassword">비밀번호 재설정</router-link>
      <div class="btn-container">
        <button type="submit" class="btn btn-green">로그인</button>
        <button type="button" class="btn btn-gray" @click="navigateToRegister">회원가입</button>
      </div>
    </form>
    <!-- 카카오 로그인 컴포넌트 추가 -->
    <KakaoLogin @loginSuccess="handleKakaoLoginSuccess" />
  </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import axios from '../axios'

function saveEmailToLocalStorage(email) {
  localStorage.setItem('rememberedEmail', email);
}

function getEmailFromLocalStorage() {
  return localStorage.getItem('rememberedEmail') || '';
}

function removeEmailFromLocalStorage() {
  localStorage.removeItem('rememberedEmail');
}

export default {
  name: 'LoginView',
  mounted() {
    this.checkSessionStatus();
    this.email = getEmailFromLocalStorage(); // 페이지 로드 시 저장된 이메일 불러오기
  },
  data() {
    return {
      // email: '',
      password: '',
      loginError: '', // 로그인 에러 메시지 상태 추가
      rememberEmail: !!localStorage.getItem('rememberedEmail'),
      email: localStorage.getItem('rememberedEmail') || ''
    }
  },
  methods: {
    ...mapActions('member', ['login', 'clearUserState']), // 'member' 모듈에서 액션 가져오기
    async handleLogin() {
      console.log('로그인 시도: ', this.email, this.password);
      try {
        await this.login({ email: this.email, password: this.password });
        if (this.$store.state.member.isLoggedIn) {
          console.log('로그인 성공');
          alert('로그인 성공');
          if (this.rememberEmail) {
            saveEmailToLocalStorage(this.email); // 이메일 기억하기가 체크된 경우 저장
          } else {
            removeEmailFromLocalStorage(); // 체크되지 않은 경우 저장된 이메일 삭제
          }
          this.$router.push('/'); // 로그인 성공 시 홈으로 이동
        } else {
          this.loginError = '로그인에 실패했습니다. 다시 시도해주세요.';
          alert('로그인 실패. 다시 시도하세요.');
        }
      } catch (error) {
        this.loginError = '로그인 중 오류가 발생했습니다.';
      }
    },
    navigateToRegister() {
      this.$router.push('/register');
    },
    checkSessionStatus() {
      axios.get('/api/members/status', { withCredentials: true })
        .then(response => {
          console.log("서버로부터 상태를 받아옴: ", response.data);
          if (!response.data.isLoggedIn) {
            this.$store.dispatch('clearUserState');
          } else {
            this.$store.commit('setLoginState', response.data);
          }
        })
        .catch(error => {
          console.error("상태 확인 요청 에러: ", error);
          this.$store.dispatch('clearUserState');
        });
    }
  },
  watch: {
    'member.isLoggedIn'(newVal) { // 'member' 모듈의 isLoggedIn 상태 변경 감지
      console.log('로그인 상태 변경:', newVal);
    }
  }
};
</script>

<style>
.social-login-container {
  margin-top: 20px;
  text-align: center;
}
</style>
