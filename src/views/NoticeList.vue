<template>
  <div class="main-container">
    <h1 class="text-melon">공지사항 목록</h1>
    <div v-for="notice in notices" :key="notice.noticeNo" class="notice box-shadow">
      <h2 class="text-bold">{{ notice.noticeTitle }}</h2>
      <p>{{ notice.noticeContent }}</p>
      <router-link :to="{ name: 'NoticeEdit', params: { id: notice.noticeNo } }" class="btn btn-gray btn-small">수정</router-link>
      <button @click="confirmDelete(notice.noticeNo)" class="btn btn-red btn-small">삭제</button>
    </div>
    <div class="btn-container">
      <router-link to="/noticecreate" class="btn btn-green btn-small">새 공지사항 작성</router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'NoticeList',
  computed: {
    ...mapGetters('notice', ['notices'])
  },
  methods: {
    ...mapActions('notice', ['fetchNotices', 'deleteNotice']),
    async confirmDelete(noticeNo) {
      if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
        try {
          await this.deleteNotice(noticeNo);
          alert('공지사항이 삭제되었습니다.');
        } catch (error) {
          console.error('공지사항 삭제 실패:', error);
          alert('공지사항 삭제에 실패했습니다.');
        }
      }
    }
  },
  created() {
    this.fetchNotices();
  }
};
</script>

<style src="../assets/styles.css"></style>
