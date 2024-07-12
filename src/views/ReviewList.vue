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
          <th>쿠폰 발급</th>
        </tr>
      </thead>
      <tbody>
        <!-- 필터링된 리뷰 목록을 순회하며 테이블 행을 생성 -->
        <tr v-for="review in filteredReviews" :key="review.reviewId">
          <td>{{ review.reviewId }}</td>
          <td>{{ truncateText(getProductName(review.productId), 15) }}</td>
          <td>
            <img style="height: 100px; width: auto;" 
              :src="getProductImage(review.productId)" 
              alt="Product Image" />
          </td>
          <td @click="goToReviewDetail(review)" style="cursor: pointer;">
            <span v-html="truncateText(extractText(review.reviewContent), 15)"></span> &nbsp;
            <i v-if="containsImageTag(review.reviewContent)" class="fa-solid fa-paperclip"></i>
          </td>
          <td>
            <star-rating v-model="review.rating" :star-size="30" :show-rating="false" :disable-click="true"></star-rating>
          </td>
          <td>{{ getMemberName(review.memberUniqueId) }}</td>
          <td>{{ formatDate(review.reviewDate) }}</td>
          <td>
            <select  v-model="selectedCoupons[review.reviewId]">
              <option value="" disabled>-쿠폰 선택-</option>
              <option v-for="coupon in activeCoupons" :key="coupon.couponId" :value="coupon.couponId">{{ coupon.couponName }}</option>
            </select>
            <button @click="issueCoupon(review.memberUniqueId, selectedCoupons[review.reviewId])">발급</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from '../axios'; // 설정된 axios 인스턴스를 import
import { mapState, mapActions} from 'vuex'; // Vuex의 헬퍼 함수 import
import StarRating from 'vue3-star-ratings'; // StarRating 컴포넌트 import

export default {
  name: 'ReviewList',
  components: {
    StarRating, // StarRating 컴포넌트 등록
  },
  data() {
    return {
      reviews: [], // 리뷰 목록을 저장할 배열
      products: {}, // 제품 정보를 저장할 객체
      selectedCoupons: {}, // 각 리뷰 ID에 대한 선택된 쿠폰을 저장할 객체
    };
  },
  computed: {
    ...mapState('member', ['members', 'isAdmin']), // Vuex 상태에서 members와 isAdmin을 가져옴
    // ...mapGetters('member', ['memberId']), // Vuex 상태에서 memberId를 가져옴
    ...mapState('coupon', ['activeCoupons']), // Vuex 상태에서 coupons을 가져옴
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
    this.fetchMembers(); // memberStore의 members를 가져옴
    this.fetchActiveCoupons(); // couponStore의 coupons을 가져옴
  },
  methods: {
    ...mapActions('member', ['fetchMembers']), // member 모듈에서 fetchMembers 액션을 맵핑
    ...mapActions('coupon', ['fetchActiveCoupons', 'createOwnedCoupon']), // coupon 모듈에서 fetchCoupons 액션을 맵핑
    async fetchReviews() {
      try {
        const response = await axios.get('/api/reviews/list'); // 모든 리뷰 데이터를 가져옴
        this.reviews = await Promise.all(response.data.map(async (review) => {
          const orderDetail = await this.fetchOrderDetailById(review.orderDetailNo); // orderDetailNo로 orderDetail 정보를 가져옴
          const order = await this.fetchOrderByOrderNo(orderDetail.orderNo); // orderNo로 order 정보를 가져옴

          return { ...review, 
            productId: orderDetail.productId, 
            orderNo: order.orderNo, 
            orderDate: order.orderDate
          }; // 리뷰 데이터에 productId, orderNo, orderDate를 추가
        }));

        await Promise.all(this.reviews.map(async (review) => {
          if (!this.products[review.productId]) {
            const productResponse = await axios.get(`/api/products/detail/${review.productId}`); // 제품 상세 정보를 가져옴
            this.products[review.productId] = productResponse.data; // products 객체에 저장
          }
        }));
        console.log('리뷰정보:', this.reviews);
      } catch (error) {
        console.error('리뷰를 가져오는 데 실패했습니다:', error);
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
    goToReviewDetail(review) {
      const queryParams = {
        reviewId: review.reviewId,
        orderNo: review.orderNo,
        orderDate: review.orderDate,
        productId: review.productId,
        productName: this.getProductName(review.productId),
        productImage: this.getProductImage(review.productId),
        orderDetailNo: review.orderDetailNo,
        reviewContent: review.reviewContent,
        rating: review.rating
      };
      console.log("후기디테일페이지로 넘기는 정보:", queryParams);

      this.$router.push({
        name: 'ReviewDetail',
        query: queryParams
      });
    },
    // -------------------------------------------------------------쿠폰 관련 메서드 시작
    async fetchCouponsDirectly() {
      console.log('쿠폰 데이터 요청 시작');
      try {
        const response = await axios.get('/api/coupons/list');
        console.log('쿠폰 데이터 요청 응답:', response.data);
        this.coupons = response.data;
      } catch (error) {
        console.error('쿠폰 데이터 요청 실패:', error);
      }
    },
    async issueCoupon(memberUniqueId, couponId) {
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
      } catch (error) {
        console.error('쿠폰 발급 실패:', error);
        alert('쿠폰 발급에 실패했습니다.');
      }
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
