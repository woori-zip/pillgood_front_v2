<template>
  <div class="box-container box-shadow">
    <h4 class="text-melon">로그인</h4>
    <!-- 기존 로그인 폼 -->
    <form @submit.prevent="handleLogin">
      <table class="line-table">
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
        <input id="chk_all" type="checkbox">
        <label for="chk_all" class="text-gray">이메일 기억하기</label>
      </div>
      <router-link to="/forgotpassword">아이디/비밀번호 찾기</router-link>
      <div class="btn-container">
        <button type="submit" class="btn btn-green">로그인</button>
        <button type="button" class="btn btn-gray" @click="navigateToRegister">회원가입</button>
      </div>
    </form>
    <!-- 카카오 로그인 컴포넌트 추가 -->
    <KakaoLogin @loginSuccess="handleKakaoLoginSuccess" />
  </div>
</template>

<script>
import axios from 'axios';
import { mapActions } from 'vuex';
import KakaoLogin from '@/components/KakaoLogin.vue'; // KakaoLogin 컴포넌트 임포트

export default {
  name: 'LoginView',
  components: {
    KakaoLogin // 컴포넌트 등록
  },
  data() {
    return {
      email: '',
      password: '',
      loginError: ''
    };
  },
  methods: {
    ...mapActions('member', ['login']),
    async handleLogin() {
      console.log('로그인 시도: ', this.email, this.password);
      try {
        await this.login({ email: this.email, password: this.password });
        if (this.$store.state.member.isLoggedIn) {
          console.log('로그인 성공');
          alert('로그인 성공');
          this.$router.push('/');
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
    async handleKakaoLoginSuccess(code) {
      try {
        const response = await axios.post('/api/members/kakaoLogin', { code });
        console.log('카카오 로그인 성공:', response.data);
      } catch (error) {
        console.error('카카오 로그인 실패:', error);
      }
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
