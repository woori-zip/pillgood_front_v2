<template>
  <div class="main-container box-shadow">
    <div class="box container">
      <h2>나의 문의</h2>
      <div class="bttn-container">
        <button @click="goToInquiryCreate" class="btn btn-green">글쓰기</button>
      </div>
      <div v-if="inquiries && inquiries.length > 0"> 
        <table class="line-table">
          <thead>
            <tr>
              <th>제목</th>
              <th>유형</th>
              <th>상태</th>
              <th>날짜</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inquiry in inquiries" :key="inquiry.inquiryNo">
              <td>
                <router-link :to="{ name: 'InquiryDetail', params: { id: inquiry.inquiryNo } }">
                  {{ inquiry.inquiryTitle }}
                </router-link>
              </td>
              <td>{{ inquiry.inquiryType }}</td>
              <td>{{ inquiry.inquiryStatus }}</td>
              <td>{{ formatDate(inquiry.inquiryDate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <p>문의가 없습니다.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';

export default {
  name: 'MyInquiries',
  computed: {
    ...mapState('member', ['member']),
    ...mapGetters('inquiry', ['allInquiries']),
    inquiries() {
      return this.allInquiries || [];
    }
  },
  methods: {
    ...mapActions('inquiry', ['fetchInquiriesByMember']),
    formatDate(date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    async fetchInquiries() {
      if (this.member && this.member.memberUniqueId) {
        try {
          await this.fetchInquiriesByMember(this.member.memberUniqueId);
          console.log('문의 조회 성공');
        } catch (error) {
          console.error('문의 조회 실패:', error);
        }
      } else {
        console.error('회원 정보가 없습니다.');
      }
    },
    goToInquiryCreate() {
      this.$router.push('/inquiries/create');
    }
  },
  async created() {
    await this.fetchInquiries();
  }
};
</script>

<style>
.line-table {
  width: 100%;
  border-collapse: collapse;
}

.line-table th, .line-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.line-table th {
  background-color: #f2f2f2;
}

.router-link {
  text-decoration: none;
  color: inherit;
}

.router-link:hover {
  text-decoration: underline;
}
</style>
