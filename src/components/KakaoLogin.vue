<template>
  <div class="social-login-container">
    <!-- <h4>소셜 로그인</h4> -->
    <br>
    <a :href="kakaoLoginUrl" @click.prevent="kakaoLogin">
      <img :src="kakaoLoginImage" alt="카카오 로그인">
    </a>
  </div>
</template>

<script>
export default {
  name: 'KakaoLogin',
  data() {
    return {
      kakaoLoginUrl: '',
      kakaoLoginImage: require('@/assets/kakao_login_medium_narrow.png')
    };
  },
  created() {
    const clientId = '03f074279f45f35b6bed2cfbcc42ec4d';
    const redirectUri = 'http://localhost:8080/login'; // 리다이렉트 URI
    this.kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  },
  methods: {
    kakaoLogin() {
      window.location.href = this.kakaoLoginUrl;
    }
  }
};
</script>

<style scoped>
.social-login-container {
  margin-top: 20px;
  text-align: center;
}
.social-login-container img {
  width: 200px;
  cursor: pointer;
}
</style>
