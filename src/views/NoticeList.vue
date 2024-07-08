<template>
  <div class="main-container">
    <h1 class="text-melon">공지사항 목록</h1>
    <input v-model="searchQuery" @input="filterNotices" type="text" placeholder="검색어 입력" class="search-container" />
    <table class="notice-table box-container">
      <thead>
        <tr>
          <th>번호</th>
          <th>제목</th>
          <th>수정</th>
          <th>삭제</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="notice in filteredNotices" :key="notice.noticeNo">
          <td>{{ notice.noticeNo }}</td>
          <td class="text-bold clickable" @click="goToDetail(notice.noticeNo)">{{ notice.noticeTitle }}</td>
          <td>
            <router-link :to="{ name: 'NoticeEdit', params: { id: notice.noticeNo } }" class="btn btn-gray btn-small">수정</router-link>
          </td>
          <td>
            <button @click="confirmDelete(notice.noticeNo)" class="btn btn-red btn-small">삭제</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="pagination btn-container">
      <button @click="fetchPreviousPage" :disabled="currentPage <= 0" class="btn btn-gray btn-small">이전</button>
      <span>{{ currentPage + 1 }} / {{ totalPages }}</span>
      <button @click="fetchNextPage" :disabled="currentPage >= totalPages - 1" class="btn btn-gray btn-small">다음</button>
    </div>
    <div class="btn-container">
      <router-link to="/noticecreate" class="btn btn-green btn-small">새 공지사항 작성</router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import '@/assets/styles.css'; // CSS 파일을 불러옵니다.

export default {
  name: 'NoticeList',
  data() {
    return {
      searchQuery: ''
    };
  },
  computed: {
    ...mapGetters('notice', ['notices', 'totalNotices', 'totalPages', 'currentPage']),
    filteredNotices() {
      if (this.searchQuery) {
        const lowerQuery = this.searchQuery.toLowerCase();
        return this.notices.filter(notice =>
          notice.noticeTitle.toLowerCase().includes(lowerQuery) ||
          notice.noticeContent.toLowerCase().includes(lowerQuery)
        );
      }
      return this.notices;
    }
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
    },
    async fetchPreviousPage() {
      if (this.currentPage > 0) {
        await this.fetchNotices({ page: this.currentPage - 1, size: 10 });
      }
    },
    async fetchNextPage() {
      if (this.currentPage < this.totalPages - 1) {
        await this.fetchNotices({ page: this.currentPage + 1, size: 10 });
      }
    },
    filterNotices() {
      // Implement the search logic here if necessary
    },
    goToDetail(noticeNo) {
      this.$router.push({ name: 'NoticeDetail', params: { id: noticeNo } });
    }
  },
  created() {
    this.fetchNotices({ page: this.currentPage, size: 10 });
  }
};
</script>

<style scoped>
.clickable {
  cursor: pointer;
  color: blue;
  text-decoration: underline;
}
</style>
