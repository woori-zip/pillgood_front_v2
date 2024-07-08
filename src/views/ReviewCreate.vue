<template>
  <div class="box-container">
    <h1>리뷰 작성</h1>
    <div>
      <img :src="productImage" alt="Product Image" style="width: 150px;">
      <p>주문 번호: {{ orderNo }}</p>
      <p>주문 날짜: {{ formattedOrderDate }}</p>
      <p>제품 이름: {{ productName }}</p>
    </div>
    <form @submit.prevent="submitReview">
      <div>
        <label>별점:</label>
        <star-rating v-model="rating" :star-size="30" :show-rating="false"></star-rating>
      </div>
      <div>
        <label>리뷰:</label>
        <rich-text-editor v-model="reviewContent"></rich-text-editor>
      </div>
      <button type="submit">리뷰 작성</button>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import StarRating from 'vue3-star-ratings'; // 기본 내보내기로 수정
import RichTextEditor from '@/components/RichTextEditor.vue';

export default {
  components: {
    'star-rating': StarRating,
    'rich-text-editor': RichTextEditor,
  },
  data() {
    return {
      reviewContent: '',
      rating: 0,
    };
  },
  computed: {
    orderNo() {
      return this.$route.query.orderNo;
    },
    orderDate() {
      return this.$route.query.orderDate;
    },
    productId() {
      return this.$route.query.productId;
    },
    productName() {
      return this.$route.query.productName;
    },
    productImage() {
      return this.$route.query.productImage;
    },
    orderDetailNo() {
      return this.$route.query.orderDetailNo;
    },
    formattedOrderDate() {
      const options = { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      const formattedDate = new Date(this.orderDate).toLocaleDateString('ko-KR', options).replace(/\./g, '').replace(/\s/g, '. ');
      return `${formattedDate}. 주문`;
    },
  },
  // order-history 로부터 받은 데이터 확인
  mounted() {
    console.log('Received query params:');
    console.log('orderNo:', this.orderNo);
    console.log('orderDate:', this.orderDate);
    console.log('productId:', this.productId);
    console.log('productName:', this.productName);
    console.log('productImage:', this.productImage);
    console.log('orderDetailNo', this.orderDetailNo);
  },
  methods: {
    ...mapActions('review', ['createReview']),
    async submitReview() {
      try {
        const reviewData = {
          orderNo: this.orderNo,
          orderDate: this.orderDate,
          productId: this.productId,
          productName: this.productName,
          reviewContent: this.reviewContent,
          rating: this.rating,
          memberUniqueId: this.memberId,
          reviewDate: new Date().toISOString(), // 클라이언트 측에서 현재 날짜와 시간을 설정하여 전송
          orderDetailNo: this.orderDetailNo
        };
        console.log('리뷰 제출:', reviewData);
        await this.createReview(reviewData);
        alert('리뷰가 성공적으로 제출되었습니다.');
        this.$router.push('/order-history'); // 리뷰 제출 후 주문 내역 페이지로 이동
      } catch (error) {
        console.error('리뷰 제출 실패:', error);
        alert('리뷰 제출에 실패했습니다.');
      }
    },
  },
};
</script>

<style scoped>
/* 스타일 설정 */
</style>