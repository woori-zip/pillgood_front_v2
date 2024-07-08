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
          <td>내용 (Quill 에디터):</td>
          <td>
            <RichTextEditor v-model="noticeContent" />
          </td>
        </tr>
      </table>
      <div class="btn-container">
        <button type="submit" class="btn btn-green">Create Notice</button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import RichTextEditor from '@/components/RichTextEditor.vue'; // RichTextEditor 컴포넌트 임포트

export default {
  name: 'NoticeCreate',
  components: {
    RichTextEditor // RichTextEditor 컴포넌트 등록
  },
  data() {
    return {
      noticeTitle: '',
      noticeContent: ''
    };
  },
  methods: {
    ...mapActions('notice', ['createNotice']),
    async submitNotice() {
      try {
        console.log('등록 데이터:', { noticeTitle: this.noticeTitle, noticeContent: this.noticeContent });
        await this.createNotice({ noticeTitle: this.noticeTitle, noticeContent: this.noticeContent });
        this.$router.push('/noticelist');
      } catch (error) {
        console.error('공지사항 등록 실패:', error);
      }
    }
  }
};
</script>

<style src="../assets/styles.css"></style>