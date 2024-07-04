<template>
  <div class="main-container">
    <h1 class="text-melon">게시글 등록</h1>
    <form @submit.prevent="submitNotice">
      <table>
        <tr>
          <td>제목:</td>
          <td><input v-model="noticeTitle" type="text" required /></td>
        </tr>
        <tr>
          <td>내용:</td>
          <td><textarea v-model="noticeContent" required></textarea></td>
        </tr>
      </table>
      <div class="btn-container">
        <button type="submit" class="btn btn-green">Create Notice</button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'NoticeCreate',
  data() {
    return {
      noticeTitle: '',
      noticeContent: ''
    };
  },
  created() {
    console.log('NoticeCreate 컴포넌트 호출');
    this.fetchNotices().then(() => {
      console.log('공지사항 데이터 가져오기 완료');
    }).catch(error => {
      console.error('공지사항 데이터 가져오기 실패:', error);
    });
  },
  methods: {
    ...mapActions('notice', ['createNotice', 'fetchNotices']),
    async submitNotice() { // 여기 메서드 이름을 다르게 설정
      try {
        await this.createNotice({ noticeTitle: this.noticeTitle, noticeContent: this.noticeContent });
        this.$router.push('/noticelist'); // 목록 페이지로 이동
      } catch (error) {
        console.error('공지사항 등록 실패:', error);
      }
    }
  },
  computed: {
    ...mapGetters('notice', ['notices']),
    noticeList() {
      console.log('notices 상태:', this.notices); // notices 상태 로그
      return this.notices;
    }
  }
};
</script>

<style src="../assets/styles.css"></style>
