<template>
  <div class="main-container">
  <div class="login-container">
    <div class="login-header">
      <h2 class="text-melon">로그인</h2>
      <p class="login-subtitle">필굿의 다양한 서비스와 혜택을 누리세요</p>
    </div>
    <form @submit.prevent="handleLogin" class="login-form">
      <ul>
        <li>
          <input type="email" id="email" v-model="email" placeholder="이메일을 입력해 주세요" required />
        </li>
        <li>
          <input type="password" id="password" v-model="password" placeholder="비밀번호를 입력해 주세요" required />
        </li>
      </ul>
      <div class="options-container">
        <div class="remember-me">
          <input type="checkbox" id="rememberMe" v-model="rememberEmail" style="width: 10px; height: 10px;"/>
          <label for="rememberMe">이메일 저장</label>
        </div>
        <div class="links">
         <router-link to="/forgotpassword">비밀번호 재설정</router-link>
        </div>
      </div>
      <div class="bttn-container">
      <button type="submit" class="btn btn-green">로그인</button>
      <div style="display: flex; gap: 50px;align-items: center;"><p class="social-login-text">카카오로 간편하게 시작하기</p>
      <KakaoLogin @loginSuccess="handleKakaoLoginSuccess" /></div>
      </div>
      <hr>
      <div class="btn-container">
      <button type="button" class="btn btn-gray" @click="navigateToRegister">회원가입</button>
      </div>
    </form>
  </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import axios from '../axios'
import KakaoLogin from '../components/KakaoLogin.vue'; // 카카오 로그인 컴포넌트 추가
import '../assets/styles.css';

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
  components: {
    KakaoLogin // 카카오 로그인 컴포넌트 추가
  },
  mounted() {
    this.email = getEmailFromLocalStorage(); // 페이지 로드 시 저장된 이메일 불러오기
    this.handleKakaoCallback(); // 카카오 로그인 콜백 처리 추가
  },
  data() {
    return {
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
    async handleKakaoCallback() { // 카카오 로그인 콜백 처리 함수 추가
      const code = this.$route.query.code;
      if (code) {
        console.log('카카오 코드:', code);
        try {
          const response = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: '03f074279f45f35b6bed2cfbcc42ec4d', // REST API 키
              redirect_uri: 'http://localhost:8080/login', // 리다이렉트 URI
              code: code,
            }).toString(),
          });

          const data = await response.json();
          if (data.access_token) {
            // 서버에 액세스 토큰을 전달하여 사용자 정보를 가져옵니다.
            const result = await axios.post('/api/social/kakao/callback', { accessToken: data.access_token });
            console.log(result.data);
            // 로그인 성공 후 처리
            if (result.data.success) {
              this.$store.commit('member/setLoginState', {
                isLoggedIn: true,
                memberId: result.data.memberId,
                member: result.data.member,
                isAdmin: result.data.isAdmin
              });
              this.$router.push('/');
            } else {
              alert('카카오 로그인 실패');
            }
          } else {
            console.error('Failed to fetch access token:', data);
          }
        } catch (error) {
          console.error('Error fetching token:', error);
        }
      }
    },
    handleKakaoLoginSuccess() {
      // 카카오 로그인 성공 처리
      console.log('카카오 로그인 성공');
    }
  },
  watch: {
    'member.isLoggedIn'(newVal) { // 'member' 모듈의 isLoggedIn 상태 변경 감지
      console.log('로그인 상태 변경:', newVal);
    }
  }
};
</script>

<style scoped>
.login-container {
  width: 400px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.login-header {
  margin-bottom: 20px;
}

.login-subtitle {
  font-size: 14px;
  color: #777;
}

.login-form ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  margin-bottom: 20px;
}

.login-form li {
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-form label {
  display: block;
  margin-bottom: 5px;
}

.login-form input {
  width: 100%;
  height: 50px;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.options-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input {
  margin-right: 5px;
}

.links {
  display: flex;
  gap: 5px;
  font-size: 15px;
  color: #777;
}

.links a {
  text-decoration: none;
  color: #777;
}

.links a:hover {
  text-decoration: underline;
}

.btn-green {
  width: 100%;
}

.btn-gray {
  width: 100%;
}

.social-login-text {
  font-size: 14px;
  color: #777;
}

.bttn-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
</style>
