<template>
  <div class="main-container">
    <h2>리뷰 리스트</h2>
    <table class="line-table">
      <thead>
        <tr>
          <th>리뷰 ID</th>
          <th>리뷰 내용</th>
          <th>평점</th>
          <th>회원 이름</th>
          <th>작성일</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="review in filteredReviews" :key="review.reviewId">
          <td>{{ review.reviewId }}</td>
          <td>{{ removePTags(review.reviewContent) }}</td>
          <td>{{ review.rating }}</td>
          <td>{{ getMemberName(review.memberUniqueId) }}</td>
          <td>{{ formatDate(review.reviewDate) }}</td>
          <td>
            <button class="small-btn" @click="editReview(review)">수정</button>
            <button class="small-btn" @click="deleteReview(review.reviewId)">삭제</button>
          </td> 
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from '../axios';
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
  name: 'ReviewList',
  data() {
    return {
      reviews: []
    };
  },
  computed: {
    ...mapState('member', ['members', 'isAdmin']),
    ...mapGetters('member', ['memberId']),
    filteredReviews() {
      let reviews;
      // ADMIN 계정일 경우 모든 리뷰를 표시하고, 일반 사용자일 경우 자신의 리뷰만 표시
      if (this.isAdmin) {
        reviews = this.reviews;
      } else {
        reviews = this.reviews.filter(review => review.memberUniqueId === this.memberId);
      }
      // 작성 일자 기준으로 최신순 정렬
      return reviews.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
    }
  },
  created() {
    this.fetchReviews();
    this.fetchMembers(); // memberStore의 members를 가져옴
  },
  methods: {
    ...mapActions('member', ['fetchMembers']),
    async fetchReviews() {
      try {
        const response = await axios.get('/api/reviews/list');
        this.reviews = response.data;
      } catch (error) {
        console.error('리뷰를 가져오는 데 실패했습니다:', error);
      }
    },
    getMemberName(memberId) {
      const member = this.members.find(member => member.memberUniqueId === memberId);
      return member ? member.name : '알 수 없음';
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString();
    },
    removePTags(content) {
      return content.replace(/<\/?p>/g, '');
    }
  }
};
</script>

<style scoped>
.review-list-container {
  padding: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background-color: #f4f4f4;
}
</style>
