<template>
  <v-container class="main-container">
    <v-card>
      <v-card-title>
        <h1 class="text-melon">리뷰 목록</h1>
      </v-card-title>

      <v-card-subtitle>
        <v-row align="center">
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="searchQuery"
              label="검색어 입력"
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="3">
            <v-btn color="primary" @click="resetFilters">초기화</v-btn>
          </v-col>
        </v-row>
      </v-card-subtitle>

      <v-data-table
        :headers="headers"
        :items="filteredReviews"
        class="elevation-1"
        item-value="reviewId"
      >
        <template v-slot:[`item.reviewId`]="{ item }">
          <span>{{ item.reviewId }}</span>
        </template>
        <template v-slot:[`item.productName`]="{ item }">
          <span>{{ truncateText(item.product.productName, 15) }}</span>
        </template>
        <template v-slot:[`item.productImage`]="{ item }">
          <img :src="item.product.productImage" alt="Product Image" style="height: 100px; width: auto;">
        </template>
        <template v-slot:[`item.reviewContent`]="{ item }">
          <span class="clickable" @click="openDetailDialog(item)">
            {{ truncateText(extractText(item.reviewContent), 15) }}A
            <i v-if="containsImageTag(item.reviewContent)" class="fa-solid fa-paperclip"></i>
          </span>
        </template>
        <template v-slot:[`item.rating`]="{ item }">
          <star-rating v-model="item.rating" :star-size="30" :show-rating="false" :disable-click="true"></star-rating>
        </template>
        <template v-slot:[`item.memberName`]="{ item }">
          <span>{{ item.memberName }}</span>
        </template>
        <template v-slot:[`item.reviewDate`]="{ item }">
          <span>{{ formatDate(item.reviewDate) }}</span>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn color="info" small @click="openEditDialog(item)">수정</v-btn>
          <v-btn color="error" small @click="confirmDelete(item.reviewId)">삭제</v-btn>
        </template>
        <template v-slot:[`item.coupon`]="{ item }">
          <div v-if="!item.couponIssued">
            <v-select
              v-model="selectedCoupons[item.reviewId]"
              :items="couponItems"
              label="쿠폰 선택"
              dense
            ></v-select>
            <v-btn color="success" small @click="issueCoupon(item.reviewId, item.memberUniqueId, selectedCoupons[item.reviewId])">발급</v-btn>
          </div>
          <div v-else>
            발급 완료
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="editDialog" max-width="800px">
      <AdminReviewEdit :review="selectedReview" @save="onReviewSave" @cancel="editDialog = false" />
    </v-dialog>

    <v-dialog v-model="detailDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <h2>{{ selectedReview.product.productName }} 리뷰</h2>
        </v-card-title>
        <v-card-text>
          <div v-html="selectedReview.reviewContent"></div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="detailDialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import StarRating from 'vue3-star-ratings';
import AdminReviewEdit from './AdminReviewEdit.vue';
import axios from '@/axios';

export default {
  name: 'AdminReviewList',
  components: { StarRating, AdminReviewEdit },
  data() {
    return {
      searchQuery: '',
      editDialog: false,
      detailDialog: false,
      selectedReview: null,
      selectedCoupons: {},
      headers: [
        { title: '리뷰 ID', value: 'reviewId', align: 'center' },
        { title: '제품 이름', value: 'productName', align: 'center' },
        { title: '제품 이미지', value: 'productImage', align: 'center' },
        { title: '리뷰 내용', value: 'reviewContent', align: 'center' },
        { title: '평점', value: 'rating', align: 'center' },
        { title: '회원 이름', value: 'memberName', align: 'center' },
        { title: '작성일', value: 'reviewDate', align: 'center', sortable: true },
        { title: '수정/삭제', value: 'actions', align: 'center', sortable: false },
        { title: '쿠폰 발급', value: 'coupon', align: 'center', sortable: false },
      ],
    };
  },
  computed: {
    ...mapGetters('review', ['reviews']),
    ...mapGetters('coupon', ['activeCoupons']),
    filteredReviews() {
      let filtered = this.reviews;

      if (this.searchQuery) {
        const lowerQuery = this.searchQuery.toLowerCase();
        filtered = filtered.filter(review =>
          review.product.productName.toLowerCase().includes(lowerQuery) ||
          review.memberName.toLowerCase().includes(lowerQuery)
        );
      }

      return filtered.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
    },
    couponItems() {
      return this.activeCoupons.map(coupon => ({
        title: coupon.couponName,
        value: coupon.couponId
      }));
    }
  },
  methods: {
    ...mapActions('review', ['fetchReviews', 'deleteReview']),
    ...mapActions('coupon', ['fetchActiveCoupons', 'createOwnedCoupon']),
    openEditDialog(review) {
      this.selectedReview = review;
      this.editDialog = true;
    },
    openDetailDialog(review) {
      this.selectedReview = review;
      this.detailDialog = true;
    },
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
        this.updateReviewCouponIssued(reviewId);
      } catch (error) {
        console.error('쿠폰 발급 실패:', error);
        alert('쿠폰 발급에 실패했습니다.');
      }
    },
    async updateReviewCouponIssued(reviewId) {
      try {
        const index = this.reviews.findIndex(review => review.reviewId === reviewId);
        if (index !== -1) {
          const updatedReview = {
            ...this.reviews[index],
            couponIssued: true
          };
          this.reviews.splice(index, 1, updatedReview);

          await axios.put('/admin/reviews/update-coupon-issued', null, {
            params: {
              reviewId,
              couponIssued: true
            }
          });
          console.log('Coupon issued status updated on server');
        } else {
          console.error('Review not found for ID:', reviewId);
        }
      } catch (error) {
        console.error('Error updating review couponIssued status:', error);
        throw error;
      }
    },
    async confirmDelete(reviewId) {
      if (confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
        try {
          await this.deleteReview(reviewId);
          alert('리뷰가 삭제되었습니다.');
        } catch (error) {
          console.error('리뷰 삭제 실패:', error);
          alert('리뷰 삭제에 실패했습니다.');
        }
      }
    },
    onReviewSave() {
      this.editDialog = false;
      this.fetchReviews();
    },
    resetFilters() {
      this.searchQuery = '';
    },
    truncateText(text, maxLength) {
      return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
    },
    extractText(content) {
      return content.replace(/<\/?[^>]+(>|$)/g, "").trim();
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString();
    },
    containsImageTag(content) {
      return /<img[^>]*src="[^"]*"[^>]*>/g.test(content);
    }
  },
  created() {
    this.fetchReviews();
    this.fetchActiveCoupons();
  }
};
</script>

<style scoped>
.main-container {
  padding: 20px;
}

.text-melon {
  color: #94b58b;
}

.clickable {
  cursor: pointer;
  text-decoration: underline;
}

.expandable-content {
  padding: 10px;
  background-color: #f9f9f9;
}
</style>
