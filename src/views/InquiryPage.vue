<template>
  <div class="main-container">
    <div class="box-container box-shadow">
      <h2 class="text-melon">문의</h2>

      <!-- 검색 필드와 드롭다운 메뉴 -->
      <div class="search-container">
        <select v-model="searchOption">
          <option value="title" selected>제목</option>
          <option value="status">상태</option>
          <option value="type">유형</option>
        </select>
        <input type="text" v-model="inputSearchQuery" placeholder="검색어를 입력하세요" />
        <button @click="searchInquiries" class="btn-green">검색</button>
      </div>

      <!-- 글쓰기 버튼 -->
      <div class="btn-container">
        <button @click="goToInquiryCreate" class="btn-green">글쓰기</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Type</th>
            <th>Title</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inquiry in filteredInquiries" :key="inquiry.inquiryNo">
            <td>{{ inquiry.inquiryNo }}</td>
            <td>{{ inquiry.inquiryType }}</td>
            <td>
              <router-link :to="{ name: 'InquiryDetail', params: { id: inquiry.inquiryNo } }">
                {{ inquiry.inquiryTitle }}
              </router-link>
            </td>
            <td>{{ inquiry.inquiryStatus }}</td>
            <td>{{ formatDate(inquiry.inquiryDate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import '../assets/styles.css';

export default {
  name: 'InquiryListPage',
  data() {
    return {
      inquiries: [],
      searchOption: 'title',
      inputSearchQuery: '',
      searchQuery: ''
    };
  },
  computed: {
    filteredInquiries() {
      if (!this.searchQuery) {
        return this.inquiries;
      }
      return this.inquiries.filter(inquiry => {
        if (this.searchOption === 'title') {
          return inquiry.inquiryTitle.includes(this.searchQuery);
        } else if (this.searchOption === 'status') {
          return inquiry.inquiryStatus.includes(this.searchQuery);
        } else if (this.searchOption === 'type') {
          return inquiry.inquiryType.includes(this.searchQuery);
        }
      });
    }
  },
  methods: {
    async fetchInquiries() {
      try {
        const response = await axios.get(`http://localhost:9095/api/inquiries/list`);
        console.log(response.data); // 서버 응답 데이터 확인
        this.inquiries = response.data;
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      }
    },
    searchInquiries() {
      this.searchQuery = this.inputSearchQuery;
      this.inputSearchQuery = ''; // 검색 버튼 클릭 시 검색어 초기화
    },
    formatDate(date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    goToInquiryCreate() {
      this.$router.push('/inquiries/create');
    }
  },
  created() {
    this.fetchInquiries();
  }
};
</script>

