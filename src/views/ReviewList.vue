<template>
  <div class="main-container">
    <h2 class="text-melon">리뷰 리스트</h2>
    <table class="line-table">
      <thead>
        <tr>
          <th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
          <th colspan="2">제품 정보</th>
          <th>리뷰 내용</th>
          <th>평점</th>
          <th>회원 이름</th>
          <th>작성일</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="review in filteredReviews" :key="review.reviewId">
          <td>{{ review.reviewId }}</td>
          <td>
            <img style="height: 100px; width: auto;" :src="review.product.productImage" alt="Prod uct Image" />
          </td>
          <td>{{ truncateText(review.product.productName, 15) }}</td>
          <td @click="goToReviewDetail(review)" style="cursor: pointer; white-space: nowrap; display: inline-flex;">
            <span v-html="truncateText(extractText(review.reviewContent), 20)"></span>
            <i v-if="containsImageTag(review.reviewContent)" class="fa-solid fa-paperclip"></i>
          </td>
          <td>
            <star-rating v-model="review.rating" :star-size="30" :show-rating="false" :disable-click="true"></star-rating>
          </td>
          <td>{{ review.memberName }}</td>
          <td>{{ formatDate(review.reviewDate) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from '../axios'; // 설정된 axios 인스턴스를 import
import '../assets/styles.css';
import { mapState, mapActions } from 'vuex'; // Vuex의 헬퍼 함수 import
import StarRating from 'vue3-star-ratings'; // StarRating 컴포넌트 import

export default {
  name: 'ReviewList',
  components: {
    StarRating, // StarRating 컴포넌트 등록
  },
  data() {
    return {
      selectedCoupons: {}, // 각 리뷰 ID에 대한 선택된 쿠폰을 저장할 객체
    };
  },
  computed: {
    ...mapState('member', ['members', 'isAdmin', 'memberId']), // Vuex 상태에서 members와 isAdmin, memberId를 가져옴
    ...mapState('coupon', ['activeCoupons']), // Vuex 상태에서 coupons을 가져옴
    ...mapState('review', ['reviews']), // Vuex 상태에서 reviews을 가져옴
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
    console.log('컴포넌트 생성됨'); // 컴포넌트 생성 로그
    this.fetchReviews(); // 컴포넌트 생성 시 리뷰 데이터를 불러옴
    this.fetchActiveCoupons(); // couponStore의 coupons을 가져옴
  },
  methods: {
    ...mapActions('coupon', ['fetchActiveCoupons', 'createOwnedCoupon']), // coupon 모듈에서 액션을 맵핑
    ...mapActions('review', ['fetchReviews']), // review 모듈에서 액션을 맵핑
    async issueCoupon(reviewId, memberUniqueId, couponId) {
      if (!couponId) {
        alert('쿠폰을 선택해주세요.');
        return;
      }

      const ownedCoupon = {
        memberUniqueId,
        couponId,
      };

      try {
        await this.createOwnedCoupon(ownedCoupon);
        alert('쿠폰이 발급되었습니다.');
        this.updateReviewCouponIssued(reviewId); // 쿠폰 발급 후 상태 업데이트
      } catch (error) {
        console.error('쿠폰 발급 실패:', error);
        alert('쿠폰 발급에 실패했습니다.');
      }
    },
    async updateReviewCouponIssued(reviewId) {
      try {
        const index = this.reviews.findIndex(review => review.reviewId === reviewId);
        console.log('Updating review at index:', index); // 인덱스 로그

        if (index !== -1) {
          const updatedReview = {
            ...this.reviews[index],
            couponIssued: true
          };
          this.reviews.splice(index, 1, updatedReview); // 배열 업데이트
          console.log('Updated review:', this.reviews[index]); // 업데이트된 리뷰 로그
          
          // 서버에 업데이트 요청
          await axios.put('/admin/reviews/update-coupon-issued', null, {
            params: {
              reviewId,
              couponIssued: true
            }
          });
          console.log('Coupon issued status updated on server');
        } else {
          console.error('Review not found for ID:', reviewId); // 리뷰를 찾을 수 없는 경우 에러 로그
        }
      } catch (error) {
        console.error('Error updating review couponIssued status:', error); // 업데이트 중 발생한 에러 로그
        throw error; // 에러를 다시 던짐
      }
    },
    async fetchOrderDetailById(orderDetailNo) {
      try {
        const response = await axios.get(`/api/order-details/${orderDetailNo}`); // orderDetailNo로 orderDetail 정보를 가져옴
        return response.data; // orderDetail 정보를 반환
      } catch (error) {
        console.error(`Failed to fetch order detail for order detail ${orderDetailNo}:`, error);
        return null;
      }
    },
    async fetchOrderByOrderNo(orderNo) {
      try {
        const response = await axios.get(`/api/orders/${orderNo}`); // orderNo로 order 정보를 가져옴
        return response.data; // order 정보를 반환
      } catch (error) {
        console.error(`Failed to fetch order for order number ${orderNo}:`, error);
        return null;
      }
    },
    getMemberName(memberId) {
      const member = this.members.find(member => member.memberUniqueId === memberId); // memberId로 회원 이름을 가져옴
      return member ? member.name : '알 수 없음';
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString(); // 날짜를 읽기 쉬운 형식으로 변환
    },
    extractText(content) {
      // <p> 태그와 다른 HTML 태그를 제거하고 텍스트만 추출
      return content.replace(/<\/?p>/g, '').replace(/<\/?[^>]+(>|$)/g, "").trim();
    },
    containsImageTag(content) { // 이미지 태그가 존재하는 지 테스트
      return /<img[^>]*src="[^"]*"[^>]*>/g.test(content);
    },
    truncateText(text, maxLength) {
      if (text.length <= maxLength) {
        return text;
      }
      return text.substring(0, maxLength) + '...';
    },
    async goToReviewDetail(review) {
      const orderDetail = await this.fetchOrderDetailById(review.orderDetailNo);
      const order = await this.fetchOrderByOrderNo(orderDetail.orderNo);
      const queryParams = {
        reviewId: review.reviewId,
        orderNo: orderDetail.orderNo,
        orderDate: order.orderDate,
        productId: review.productId,
        productName: review.product.productName,
        productImage: review.product.productImage,
        orderDetailNo: review.orderDetailNo,
        reviewContent: review.reviewContent,
        rating: review.rating
      };
      console.log("후기디테일페이지로 넘기는 정보:", queryParams);

      this.$router.push({
        name: 'ReviewDetail',
        query: queryParams
      });
    }
  }
};
</script>

<style scoped>
 .line-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
  }

  .line-table td, tr, th {
    border: none;
  }
</style>
