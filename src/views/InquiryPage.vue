<template>
  <div class="main-container">
    <div class="box-container box-shadow">
      <h2 class="text-melon">문의</h2>

      <!-- 검색 필드 -->
      <div class="search-container">
        <select v-model="searchOption">
          <option value="title" selected>제목</option>
          <option value="status">상태</option>
          <option value="type">유형</option>
        </select>
        <div class="select-conatiner">
        <div v-if="searchOption === 'title'">
          <input type="text" v-model="inputSearchQuery" placeholder="검색어를 입력하세요" />
        </div>
        <div v-else-if="searchOption === 'status'">
          <select v-model="inputSearchQuery">
            <option value="open">답변 완료</option>
            <option value="closed">미답변</option>
          </select>
        </div>
        <div v-else-if="searchOption === 'type'">
          <select v-model="inputSearchQuery">
            <option value="general">일반</option>
            <option value="product">제품</option>
            <option value="order">주문</option>
          </select>
        </div>
        </div>
        <button class="icon-button" @click="searchInquiries"><i class="fa-solid fa-magnifying-glass"></i></button>
      </div>

      <!-- 글쓰기 버튼
      <div class="bttn-container">
        <button @click="goToInquiryCreate" class="btn btn-green">글쓰기</button>
      </div> -->

      <table class="line-table">
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
                <i v-if="hasImage(inquiry.inquiryContent)" class="fa-solid fa-image"></i>
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
        const response = await axios.get(`/api/inquiries/list`);
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
    },
    hasImage(content) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const imgTags = doc.querySelectorAll('img');
      return imgTags.length > 0;
    }
  },
  created() {
    this.fetchInquiries();
  }
};
</script>

<style scope>
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  margin: 5px;
  font-size: 1em;
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  color: #B4D9A9;
}

.icon-button:hover {
  color: #98c387; /* 호버 시 색상 변경 */
}

.search-container {
	display: flex;
	justify-content: flex-end;
}

.search-container select {
	width: 100px;
}

.search-container input {
	width: 300px;
}

.select-conatiner {
	display: flex;
	justify-content: center;
}

.select-conatiner select {
  width: 300px;
}

.icon-button {
	margin-left: 10px;
}

</style>
