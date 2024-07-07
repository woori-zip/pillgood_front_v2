<template>
  <div class="main-container">
    <h2 class="text-melon">리뷰 리스트</h2>
    <table class="line-table">
      <thead>
        <tr>
          <th>리뷰 ID</th>
          <th>제품 이름</th>
          <th>제품 이미지</th>
          <th>리뷰 내용</th>
          <th>평점</th>
          <th>회원 이름</th>
          <th>작성일</th>
          <th>수정</th>
          <th>삭제</th>
        </tr>
      </thead>
      <tbody>
        <!-- 필터링된 리뷰 목록을 순회하며 테이블 행을 생성 -->
        <tr v-for="review in filteredReviews" :key="review.reviewId">
          <td>{{ review.reviewId }}</td>
          <td>{{ getProductName(review.productId) }}</td>
          <td>
            <img style="height: 100px; width: auto;" 
              :src="getProductImage(review.productId)" 
              alt="Product Image" />
          </td>
          <td>{{ removePTags(review.reviewContent) }}</td>
          <td>{{ review.rating }}</td>
          <td>{{ getMemberName(review.memberUniqueId) }}</td>
          <td>{{ formatDate(review.reviewDate) }}</td>
          <td><button class="small-btn" @click="editReview(review.reviewId)">수정</button></td>
          <td><button class="small-btn" @click="deleteReview(review.reviewId)">삭제</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from '../axios'; // 설정된 axios 인스턴스를 import
import { mapState, mapActions, mapGetters } from 'vuex'; // Vuex의 헬퍼 함수 import

export default {
  name: 'ReviewList',
  data() {
    return {
      reviews: [], // 리뷰 목록을 저장할 배열
      products: {} // 제품 정보를 저장할 객체
    };
  },
  computed: {
    ...mapState('member', ['members', 'isAdmin']), // Vuex 상태에서 members와 isAdmin을 가져옴
    ...mapGetters('member', ['memberId']), // Vuex 상태에서 memberId를 가져옴
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
    this.fetchReviews(); // 컴포넌트 생성 시 리뷰 데이터를 불러옴
    this.fetchMembers(); // memberStore의 members를 가져옴
  },
  methods: {
    ...mapActions('member', ['fetchMembers']), // member 모듈에서 fetchMembers 액션을 맵핑
    async fetchReviews() {
      try {
        const response = await axios.get('/api/reviews/list'); // 모든 리뷰 데이터를 가져옴
        this.reviews = await Promise.all(response.data.map(async (review) => {
          const productId = await this.fetchProductIdByOrderDetailNo(review.orderDetailNo); // orderDetailNo로 productId를 가져옴
          return { ...review, productId }; // 리뷰 데이터에 productId를 추가
        }));
        await Promise.all(this.reviews.map(async (review) => {
          if (!this.products[review.productId]) {
            const productResponse = await axios.get(`/api/products/detail/${review.productId}`); // 제품 상세 정보를 가져옴
            this.products[review.productId] = productResponse.data; // products 객체에 저장
          }
        }));
      } catch (error) {
        console.error('리뷰를 가져오는 데 실패했습니다:', error);
      }
    },
    async fetchProductIdByOrderDetailNo(orderDetailNo) {
      try {
        const response = await axios.get(`/api/order-details/${orderDetailNo}`); // orderDetailNo로 orderDetail 정보를 가져옴
        return response.data.productId; // productId를 반환
      } catch (error) {
        console.error(`Failed to fetch product ID for order detail ${orderDetailNo}:`, error);
        return null;
      }
    },
    getMemberName(memberId) {
      const member = this.members.find(member => member.memberUniqueId === memberId); // memberId로 회원 이름을 가져옴
      return member ? member.name : '알 수 없음';
    },
    getProductName(productId) {
      return this.products[productId] ? this.products[productId].productName : '알 수 없음'; // productId로 제품 이름을 가져옴
    },
    getProductImage(productId) {
      if (this.products[productId]) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.products[productId].productImage, 'text/html'); // productImage HTML을 파싱
        const imgTag = doc.querySelector('img'); // img 태그를 찾음
        return imgTag ? imgTag.src : '';
      }
      return '';
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString(); // 날짜를 읽기 쉬운 형식으로 변환
    },
    removePTags(content) {
      return content.replace(/<\/?p>/g, ''); // <p> 태그를 제거
    },
    editReview(reviewId) {
      // 리뷰 수정 로직
      console.log(`Editing review with ID: ${reviewId}`);
    },
    deleteReview(reviewId) {
      // 리뷰 삭제 로직
      console.log(`Deleting review with ID: ${reviewId}`);
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