<template>
  <div class="main-container">
    <div class="login-box">
      <div class="form-container">
        <!-- 기존 로그인 폼 -->
        <form @submit.prevent="handleLogin" class="login-form">
          <h4 class="text-melon">로그인</h4>
          <div class="input-container">
            <label for="email" class="text-melon">이메일</label>
            <input type="email" id="email" v-model="email" required />
          </div>
          <div class="input-container">
            <label for="password" class="text-melon">비밀번호</label>
            <input type="password" id="password" v-model="password" required />
          </div>
          <div class="btn-container">
            <button type="submit" class="btn btn-green">로그인</button>
          </div>
        </form>
      </div>

      <!-- 중앙에 세로 선 추가 -->
      <div class="vertical-line"></div>

      <!-- 카카오 로그인 컴포넌트 추가 -->
      <div class="social-container">
        <h4 class="text-melon">소셜 로그인</h4>
        <KakaoLogin @loginSuccess="handleKakaoLoginSuccess" />
      </div>

      <div class="btn-container2">
        <button type="button" class="btn btn-gray" @click="navigateToRegister">회원가입</button>
      </div>

      <div class="check-container">
        <input id="chk_all" type="checkbox" v-model="rememberEmail">
        <label for="chk_all" class="text-gray">이메일 기억하기</label>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <router-link to="/forgotpassword">비밀번호 재설정</router-link>
      </div>
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
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 20px;
}

.login-box {
  display: flex;
  flex-direction: column; /* 세로 정렬 */
  align-items: center; /* 수평 중앙 정렬 */
  padding: 20px;
  border-radius: 10px;
  width: 100%; /* 너비를 부모 요소에 맞추기 */
  max-width: 600px; /* 최대 너비 설정 */
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.form-container,
.social-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-form {
  width: 100%;
}

.input-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.input-container label {
  margin-bottom: 5px;
}

.input-container input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.btn-container {
  display: flex;
  justify-content: center;
}

.btn-container2,
.check-container {
  margin-top: 20px;
  text-align: center; /* 중앙 정렬 */
}

.check-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.vertical-line {
  width: 80%;
  height: 1px; /* 선의 높이 */
  background-color: #ddd; /* 선의 색상 */
  margin: 20px 0; /* 위아래 마진 */
}

@media (min-width: 600px) {
  .login-box {
    flex-direction: row; /* 큰 화면에서는 가로 정렬 */
    justify-content: space-between;
  }

  .vertical-line {
    width: 1px; /* 높이 대신 너비를 1px로 설정 */
    height: auto; /* 높이를 자동으로 설정 */
    margin: 0 20px; /* 좌우 마진 */
  }

  .form-container,
  .social-container {
    width: 45%;
  }

  .check-container {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
