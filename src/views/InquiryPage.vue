<template>
  <div class="main-container">
    <div class="box-container box-shadow">
      <h2 class="text-melon">문의</h2>

      <!-- 검색 필드와 드롭다운 메뉴 -->
      <div class="search-container">
        <select v-model="selectedSearchOption">
          <option value="title" selected>제목</option>
          <option value="status">상태</option>
          <option value="type">유형</option>
        </select>
        <input type="text" v-model="inputSearchQuery" placeholder="검색어를 입력하세요" />
        <button @click="searchInquiries">검색</button>
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
            <td>{{ inquiry.inquiryTitle }}</td>
            <td>{{ inquiry.inquiryStatus }}</td>
            <td>{{ formatDate(inquiry.inquiryDate) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 글쓰기 버튼 -->
      <div class="button-container">
        <button @click="goToInquiryCreate">글쓰기</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

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
        console.log(response.data); //서버 응답 데이터 확인
        this.inquiries = response.data;
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      }
    },
     searchInquiries() {
      this.searchQuery = this.inputSearchQuery;
      this.inputSearchQuery = ''; //검색 버튼 클릭 시 검색어 초기화
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

<style scoped>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.box-container {
  background: white;
  padding: 30px;
  width: 80%;
  max-width: 800px; /* 컨테이너 너비를 조정 */
  margin: 20px auto;
  text-align: center;
  box-sizing: border-box;
}

.box-shadow {
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

thead {
  background-color: #f9f9f9;
}

h2.text-melon {
  color: #94b58b;
  font-weight: bold;
}

.button-container {
  margin-top: 20px; /* 테이블과의 간격을 추가합니다 */
  text-align: right;
}

.button-container button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

.button-container button:hover {
  background-color: #45a049;
}

.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.search-container select,
.search-container input {
  padding: 5px;
  margin-right: 10px;
}

.search-container button {
  padding: 5px 10px;
}

@media (max-width: 1200px) {
  .main-container {
    width: 100%;
  }
  
  .box-container {
    width: 100%;
  }
}
</style>