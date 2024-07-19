<template>
  <div class="main-container">
    <h2 class="text-melon">후기 상세보기</h2>
    <div class="box-container">
    <!-- 제품정보 출력 -->
    <div style="display: flex; padding: 20px;">
      <img :src="productImage" alt="Product Image" style="width: 100px;">
      <div style="text-align: left;">
        <p>
          주문 번호: {{ orderNo }} <br>
          제품명: {{ productName }} <br>
          주문 날짜: {{ formattedOrderDate }} <br>
        </p>
      </div>
    </div>

    <!-- 이미지 -->
    <div v-if="!isEditing">
      <div v-for="image in extractImages(reviewContent)" :key="image" style="display: inline-block; margin: 5px;">
        <img :src="image" alt="Review Image" style="width: 100px;">
      </div>
    </div>

    <!-- 별점 -->
    <div style="text-align: center;">
      <star-rating v-model="rating" :star-size="30" :show-rating="false" :disable-click="!isEditing"></star-rating>
    </div>

    <!-- 내용 -->
    <div v-if="isEditing">
      <RichTextEditor v-model="reviewContent" />
    </div>
    <div v-else v-html="extractText(reviewContent)"></div>
    <div class="btn-container">
      <button v-if="!isEditing" @click="isEditing = true" class="btn btn-green">수정</button>
      <button v-else @click="saveReview" class="btn btn-green">저장</button>
      <button @click="navigateToReviewList" class="btn btn-gray">목록으로</button>
    </div>
    </div>
  </div>
</template>

<script>
import axios from '../axios'
import StarRating from 'vue3-star-ratings';
import { mapState } from 'vuex';
import '../assets/styles.css';
import RichTextEditor from '@/components/RichTextEditor.vue';

export default {
  components: {
    'star-rating': StarRating,
    RichTextEditor
  },
  data() {
    return {
      reviewContent: '',
      rating: 0,
      reviewId: null,
      isEditing: false
    };
  },
  computed: {
    ...mapState('member', ['memberId']),
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
    this.reviewId = this.$route.query.reviewId;
    this.reviewContent = this.$route.query.reviewContent || '';
    this.rating = this.$route.query.rating || 0;

    console.log('Received query params:');
    console.log('orderNo:', this.orderNo);
    console.log('orderDate:', this.orderDate);
    console.log('productId:', this.productId);
    console.log('productName:', this.productName);
    console.log('productImage:', this.productImage);
    console.log('orderDetailNo:', this.orderDetailNo);
  },
  methods: {
    extractText(content) {
      // 텍스트만 추출
      return content.replace(/<\/?p>/g, '').replace(/<\/?[^>]+(>|$)/g, "").trim();
    },
    extractImages(content) {
      // 이미지 URL을 추출하는 로직
      const images = [];
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const imgTags = doc.querySelectorAll('img');
      imgTags.forEach(img => {
        images.push(img.src);
      });
      return images;
    },
    async saveReview() {
      try {
        const response = await axios.put(`/api/reviews/update/${this.reviewId}`, {
          reviewContent: this.reviewContent,
          rating: this.rating
        }, {
          withCredentials: true
        });
        console.log('서버응답:', response),
        console.log('Review updated successfully');
        this.isEditing = false;
      } catch (error) {
        console.error('Failed to update review:', error);
      }
    },
    navigateToReviewList() {
      this.$router.push('/reviewlist');
    }
  }
};
</script>

<style scoped>
.box-container {
  background: white;
  padding: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  text-align: left;
}
</style>
