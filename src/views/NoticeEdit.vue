<template>
  <div class="main-container">
    <h1 class="text-melon">게시글 수정</h1>
    <form @submit.prevent="submitNoticeUpdate">
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
        <button type="submit" class="btn btn-green">Update Notice</button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'NoticeEdit',
  data() {
    return {
      noticeTitle: '',
      noticeContent: ''
    };
  },
  created() {
    this.loadNotice();
  },
  methods: {
    ...mapActions('notice', ['fetchNotice', 'updateNotice']),
    async loadNotice() {
      try {
        const notice = await this.fetchNotice(this.$route.params.id);
        this.noticeTitle = notice.noticeTitle;
        this.noticeContent = notice.noticeContent;
      } catch (error) {
        console.error('Failed to fetch notice:', error);
      }
    },
    async submitNoticeUpdate() {
      try {
        await this.updateNotice({ id: this.$route.params.id, noticeTitle: this.noticeTitle, noticeContent: this.noticeContent });
        this.$router.push('/noticelist'); // 목록 페이지로 이동
      } catch (error) {
        console.error('Failed to update notice:', error);
      }
    }
  }
};
</script>

<style src="../assets/styles.css"></style>
