<template>
  <div class="box-container box-shadow">
    <h4 class="text-melon">비밀번호 재설정</h4>
    <form @submit.prevent="handleResetPassword">
      <table>
        <tr>
          <td><label for="newPassword" class="text-melon">새 비밀번호</label></td>
          <td><input type="password" id="newPassword" v-model="newPassword" required /></td>
        </tr>
        <tr>
          <td><label for="confirmPassword" class="text-melon">새 비밀번호 확인</label></td>
          <td><input type="password" id="confirmPassword" v-model="confirmPassword" required /></td>
        </tr>
      </table>
      <div class="btn-container">
        <button type="submit" class="btn btn-green">비밀번호 재설정</button>
        <router-link to="/login" class="btn btn-gray">로그인으로 돌아가기</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ChangePasswordView',
  data() {
    return {
      newPassword: '',
      confirmPassword: '',
      token: this.$route.query.token // URL 쿼리에서 토큰 가져오기
    }
  },
  methods: {
    async handleResetPassword() {
      if (this.newPassword !== this.confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
      try {
        await axios.post('/api/members/resetpassword', { token: this.token, newPassword: this.newPassword });
        alert('비밀번호가 재설정되었습니다.');
        this.$router.push('/login');
      } catch (error) {
        console.error('비밀번호 재설정 오류: ', error);
        if (error.response && error.response.data) {
          if (error.response.data === '비밀번호 재설정에 실패했습니다.') {
            alert('토큰이 만료되었거나 유효하지 않습니다. 다시 시도해주세요.');
          } else {
            alert(error.response.data);
          }
        } else {
          alert('비밀번호 재설정에 실패했습니다.');
        }
      }
    }
  }
}
</script>