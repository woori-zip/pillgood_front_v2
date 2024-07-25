<template>
  <div class="main-container">
    <div class="box-container">
      <table class="line-table" v-if="notice">
        <tr>
          <td>제목</td>
          <td><strong>{{ notice.noticeTitle }}</strong></td>
        </tr>
        <tr>
          <td colspan="2">
            <div class="content-cell" v-html="notice.noticeContent"></div>
          </td>
        </tr>
      </table>
      <div v-else>
        Loading...
      </div>
    </div>
    <div class="btn-container">
      <router-link to="/noticelist" class="btn btn-gray btn-small">목록으로</router-link>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import '@/assets/styles.css';

export default {
  name: 'NoticeDetail',
  data() {
    return {
      notice: null
    };
  },
  methods: {
    ...mapActions('notice', ['fetchNotice']),
    async loadNotice() {
      const noticeId = this.$route.params.id;
      try {
        const response = await this.fetchNotice(noticeId);
        this.notice = response.data; // fetchNotice 액션의 반환 값을 사용하여 notice를 설정
      } catch (error) {
        console.error('공지사항을 불러오지 못했습니다:', error);
      }
    }
  },
  async created() {
    await this.loadNotice();
  }
};
</script>

<style scoped>
.line-table tr td {
  padding: 10px;
  text-align: left; /* 텍스트를 왼쪽 정렬로 설정 */
  vertical-align: top; /* 텍스트를 위쪽으로 정렬 */
}

.content-cell {
  min-height: 300px; /* 내용 부분의 최소 높이 설정 */
  display: block; /* 내용 부분의 레이아웃 설정 */
  text-align: left; /* 텍스트를 왼쪽 정렬로 설정 */
  white-space: pre-line; /* 줄바꿈을 반영 */
}
</style>
