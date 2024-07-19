<template>
  <div class="main-container">
    <h2 class="text-melon">리뷰 작성</h2>
    <div style="text-align: left; display: flex">
      <img :src="productImage" alt="Product Image" style="width: 150px;">
      <p>
        주문 번호: {{ orderNo }}<br>
        주문 날짜: {{ formattedOrderDate }}<br>
        제품 이름: {{ productName }}
      </p>
    </div>
    <form @submit.prevent="submitReview">
      <star-rating 
        v-model="rating" 
        :star-size="30" 
        :show-rating="false"
        style="margin: 0 auto 10px auto;"
      ></star-rating>
      <div>
        <span v-if="error" class="error">{{ error }}</span> <!-- 에러 메시지 표시 -->
        <rich-text-editor v-model="reviewContent" ref="richTextEditor" @text-change="handleTextChange"></rich-text-editor>
      </div>
      <div class="btn-container">
        <button type="submit" class="btn btn-green">리뷰 작성</button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import '../assets/styles.css';
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
      error: null, // 에러 메시지
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
    handleTextChange(textContent) {
      console.log('Text content:', textContent);
      if (textContent.length >= 10){
        this.error = null;
      } else {
        this.error = '리뷰는 최소 10자 이상 작성해야 합니다.'
      }
    },
    async submitReview() {

      const textContent = this.$refs.richTextEditor.getTextContent();
      console.log('textContent.length:', textContent.length); // textContent.length 출력

      if (textContent.length < 10) {
        this.error = '리뷰는 최소 10자 이상 작성해야 합니다.';
        return;
      }

      this.error = null; // 에러 메시지 제거

      try {
        const reviewData = {
          orderNo: this.orderNo,
          orderDate: this.orderDate,
          productId: this.productId,
          productName: this.productName,
          reviewContent: this.reviewContent,
          rating: this.rating,
          memberUniqueId: this.memberId,
          reviewDate: new Date().toISOString(),
          orderDetailNo: this.orderDetailNo
        };
        console.log('리뷰 제출:', reviewData);
        await this.createReview(reviewData);
        alert('리뷰가 성공적으로 제출되었습니다.');
        this.$router.push('/order-history');
      } catch (error) {
        console.error('리뷰 제출 실패:', error);
        alert('리뷰 제출에 실패했습니다.');
      }
    },
  },
};
</script>

<style scoped>
.error {
  color: red;
  margin-top: 5px;
}
</style>
