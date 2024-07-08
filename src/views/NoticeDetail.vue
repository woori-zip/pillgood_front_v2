<template>
  <div class="main-container">
    <h1 class="text-melon">{{ notice.noticeTitle }}</h1>
    <div class="box-container">
      <p v-html="notice.noticeContent"></p>
    </div>
    <div class="btn-container">
      <router-link to="/noticelist" class="btn btn-gray btn-small">목록으로</router-link>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'NoticeDetail',
  data() {
    return {
      notice: {}
    };
  },
  computed: {
    ...mapGetters('notice', ['notices'])
  },
  methods: {
    ...mapActions('notice', ['fetchNotice']),
    async loadNotice() {
      const noticeId = this.$route.params.id;
      await this.fetchNotice(noticeId);
      this.notice = this.notices.find(n => n.noticeNo == noticeId);
    }
  },
  created() {
    this.loadNotice();
  }
};
</script>

<style scoped>
/* 추가적인 스타일이 필요하다면 여기에 작성합니다. */
</style>
