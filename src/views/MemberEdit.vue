<template>
  <div class="main-container box-shadow">
    <h1 class="text-melon">회원 정보 수정</h1>
    <form @submit.prevent="saveMember">
      <table class="line-table">
        <tr>
          <td>이름</td>
          <td><input v-model="member.name" type="text" required /></td>
          <td>나이</td>
          <td><input v-model="member.age" type="number" required /></td>
          <td>성별</td>
          <td>
            <select v-model="member.gender" required>
              <option value="F">여성</option>
              <option value="M">남성</option>
            </select>
          </td>
          <td>구독여부</td>
          <td>
            <select v-model="member.subscriptionStatus">
              <option :value="true">구독중</option>
              <option :value="false">-</option>
            </select>
          </td>
        </tr>
        <tr>
          <td>이메일</td>
          <td><input v-model="member.email" type="email" required /></td>
          <td>휴대폰번호</td>
          <td><input v-model="member.phoneNumber" type="text" required /></td>
          <td>권한</td>
          <td>
            <select v-model="member.memberLevel" required>
              <option value="ADMIN">관리자</option>
              <option value="USER">사용자</option>
            </select>
          </td>
        </tr>
      </table>
      <div class="btn-container">
        <button type="submit" class="btn btn-green">저장</button>
        <button type="button" class="btn btn-gray" @click="cancelEdit">취소</button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'MemberEdit',
  data() {
    return {
      member: {
        name: '',
        age: '',
        email: '',
        phone: '',
        gender: '',
        subscriptionStatus: false,
        memberLevel: ''
      }
    };
  },
  computed: {
    ...mapState('member', ['editingMember'])
  },
  created() {
    if (this.editingMember) {
      console.log('MemberEdit에서 받은 memberId:', this.editingMember.memberId);  // 콘솔 로그 추가
      this.member = { ...this.editingMember };
    } else {
      this.$router.push('/memberlist');
    }
  },
  methods: {
    ...mapActions('member', ['updateMember']),
    async saveMember() {
      try {
        await this.updateMember(this.member);
        this.$router.push('/memberlist');
      } catch (error) {
        console.error('회원 정보를 업데이트하는 중 오류 발생:', error);
      }
    },
    cancelEdit() {
      this.$router.push('/memberlist');
    }
  }
};
</script>

<style>
.line-table td input {
  width: 100%;
  margin: 5px auto;
  padding: 3px;
}
</style>
