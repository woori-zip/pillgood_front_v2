<template>
  <v-card>
    <v-card-title>
      <h1 class="text-melon">리뷰 수정</h1>
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="saveReview">
        <v-row>
          <v-col cols="12">
            <RichTextEditor v-model="reviewContent" />
          </v-col>
          <v-col cols="12" style="text-align: center;">
            <star-rating v-model="rating" :star-size="30" :show-rating="false"></star-rating>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" type="submit">저장</v-btn>
          <v-btn color="grey" @click="$emit('cancel')">취소</v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from '@/axios'; // 올바른 경로로 설정
import StarRating from 'vue3-star-ratings';
import RichTextEditor from '@/components/RichTextEditor.vue';

export default {
  name: 'AdminReviewEdit',
  components: {
    'star-rating': StarRating,
    RichTextEditor
  },
  props: {
    review: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      reviewContent: this.review.reviewContent,
      rating: this.review.rating
    };
  },
  methods: {
    async saveReview() {
      try {
        await axios.put(`/api/reviews/update/${this.review.reviewId}`, {
          reviewContent: this.reviewContent,
          rating: this.rating
        });
        this.$emit('save');
      } catch (error) {
        console.error('Failed to update review:', error);
      }
    }
  }
};
</script>

<style scoped>
.text-melon {
  color: #ff6f61;
}
</style>
