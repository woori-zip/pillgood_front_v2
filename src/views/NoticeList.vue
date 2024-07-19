<template>
  <div class="main-container">
    <h1 class="text-melon" @click="resetSearch">공지사항</h1>
    <div class="box-container-no-shade">
      <div class="search-container">
        <select v-model="searchOption" style="margin-right: 10px;">
          <option value="title" selected>제목</option>
          <option value="content">내용</option>
        </select>
        <div>
          <input type="text" v-model="inputSearchQuery" placeholder="검색어를 입력하세요" />
        </div>
        <button class="icon-button" @click="searchNotices"><i class="fa-solid fa-magnifying-glass"></i></button>
      </div>

      <table class="line-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>제목</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="notice in filteredNotices" :key="notice.noticeNo">
            <td>{{ notice.noticeNo }}</td>
            <td @click="goToDetail(notice.noticeNo)">{{ notice.noticeTitle }}</td>
          </tr>
        </tbody>
      </table>
      <div class="btn-container">
        <div class="pagination">
          <button @click="fetchPreviousPage" :disabled="currentPage <= 0" class="small-btn btn-gray">이전</button>
          <span>&nbsp;{{ currentPage + 1 }} / {{ totalPages }}&nbsp;</span>
          <button @click="fetchNextPage" :disabled="currentPage >= totalPages - 1" class="small-btn btn-gray">다음</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import '@/assets/styles.css';

export default {
  name: 'NoticeList',
  data() {
    return {
      searchOption: 'title',
      inputSearchQuery: '',
      searchQuery: ''
    };
  },
  computed: {
    ...mapGetters('notice', ['notices', 'totalNotices', 'totalPages', 'currentPage']),
    filteredNotices() {
      if (!this.searchQuery) {
        return this.notices;
      }
      const lowerQuery = this.searchQuery.toLowerCase();
      return this.notices.filter(notice => {
        if (this.searchOption === 'title') {
          return notice.noticeTitle.toLowerCase().includes(lowerQuery);
        } else if (this.searchOption === 'content') {
          return notice.noticeContent.toLowerCase().includes(lowerQuery);
        }
      });
    }
  },
  methods: {
    ...mapActions('notice', ['fetchNotices']),
    fetchPreviousPage() {
      if (this.currentPage > 0) {
        this.fetchNotices({ page: this.currentPage - 1, size: 10 });
      }
    },
    fetchNextPage() {
      if (this.currentPage < this.totalPages - 1) {
        this.fetchNotices({ page: this.currentPage + 1, size: 10 });
      }
    },
    searchNotices() {
      this.searchQuery = this.inputSearchQuery;
    },
    goToDetail(noticeNo) {
      this.$router.push({ name: 'NoticeDetail', params: { id: noticeNo } });
    },
    resetSearch() {
      this.inputSearchQuery = '';
      this.searchQuery = '';
      this.fetchNotices({ page: 0, size: 10 });
    }
  },
  created() {
    this.fetchNotices({ page: this.currentPage, size: 10 });
  }
};
</script>

<style scoped>

</style>
