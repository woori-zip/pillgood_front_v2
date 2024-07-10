<template>
  <div class="box-container box-shadow">
    <h4 class="text-melon">비밀번호 찾기</h4>
    <form @submit.prevent="handleForgotPassword">
      <table>
        <tr>
          <td><label for="email" class="text-melon">이메일</label></td>
          <td><input type="email" id="email" v-model="email" required /></td>
        </tr>
      </table>
      <div class="btn-container">
        <button type="submit" class="btn btn-green">비밀번호 찾기</button>
        <router-link to="/login" class="btn btn-gray">로그인으로 돌아가기</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ForgotPasswordView',
  data() {
    return {
      email: ''
    }
  },
  methods: {
    async handleForgotPassword() {
      try {
        await axios.post('/api/members/forgotpassword', { email: this.email });
        alert('일련번호가 이메일로 전송되었습니다.');
        this.$router.push('/resetpassword');
      } catch (error) {
        console.error('비밀번호 찾기 오류: ', error);
        alert('비밀번호 찾기 요청에 실패했습니다.');
      }
    }
  }
}
</script>

<style scoped>
/* 스타일 추가 */
</style>
