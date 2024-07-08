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
          <td>내용 (Quill 에디터):</td>
          <td>
            <RichTextEditor v-model="noticeContent" />
          </td>
        </tr>
      </table>
      <div class="btn-container">
        <button type="submit" class="btn btn-green">Update Notice</button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import RichTextEditor from '@/components/RichTextEditor.vue'; // RichTextEditor 컴포넌트 임포트

export default {
  name: 'NoticeEdit',
  components: {
    RichTextEditor // RichTextEditor 컴포넌트 등록
  },
  data() {
    return {
      noticeTitle: '',
      noticeContent: ''
    };
  },
  computed: {
    ...mapGetters('notice', ['notice'])
  },
  watch: {
    notice(newNotice) {
      if (newNotice) {
        this.noticeTitle = newNotice.noticeTitle;
        this.noticeContent = newNotice.noticeContent;
      }
    }
  },
  created() {
    this.loadNotice();
  },
  methods: {
    ...mapActions('notice', ['fetchNotice', 'updateNotice']),
    async loadNotice() {
      try {
        await this.fetchNotice(this.$route.params.id);
      } catch (error) {
        console.error('Failed to fetch notice:', error);
      }
    },
    async submitNoticeUpdate() {
      try {
        await this.updateNotice({ id: this.$route.params.id, noticeTitle: this.noticeTitle, noticeContent: this.noticeContent });
        this.$router.push('/noticelist');
      } catch (error) {
        console.error('Failed to update notice:', error);
      }
    }
  }
};
</script>

<style src="../assets/styles.css"></style>
