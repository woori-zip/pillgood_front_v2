<template>
  <div class="main-container">
    <div class="box-container-no-shade">
    <!-- <h3 class="text-melon">주문 상세 내역</h3> -->

    <!-- 주문 상세 -->
    <div v-if="order" class="box-container">
    <p style="text-align: left;">
      <span style="font-weight: bold; font-size: 20px;">{{ order.orderStatus }}</span> {{ order.orderNo }}
    </p>
    <!-- 주문상세 리스트 -->
    <table class="line-table">
      <thead>
        <tr>
          <th>주문 날짜</th>
          <th>제품명</th>
          <th>금액</th>
          <th>리뷰 쓰기/재구매</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="detail in order.details" :key="detail.orderDetailNo">
          <td>{{ formatDate(order.orderDate) }}</td>
          <td>{{ getProductName(detail.productId) }}</td>
          <td>{{ detail.amount }}원</td>
          <td v-if="order.orderStatus === '구매확정'">
            <div class="btn-container">
              <button v-if="hasReview(detail.orderDetailNo)" class="btn btn-green" @click="goToReviewDetail(order, detail)">내 리뷰 보기</button>
              <button v-else class="btn btn-green" @click="goToReviewPage(order, detail)">리뷰쓰기</button>
              <button class="btn btn-gray" @click="addToCart(detail.productId, 1)">재구매</button>
            </div>
          </td>
          <td v-else>구매 확정을 완료해 주세요</td>
        </tr>
      </tbody>
    </table>
  </div>
  </div>
  </div>
</template>

<script>
import axios from '../axios'; // 'axios.js' 설정 파일을 import
import { mapActions } from 'vuex';
import '../assets/styles.css';

export default {
  props: {
    orderNo: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      order: null,
      products: {}, // 제품 정보를 저장할 객체
      reviews: [], // 리뷰 정보를 저장할 배열
      loading: true,
    };
  },
  methods: {
    ...mapActions('cart', ['addToCart']),
    async fetchOrderDetails() {
      try {
        console.log(`Received order number: ${this.orderNo}`); // 콘솔에 주문 번호 출력
        const response = await axios.get(`/api/orders/${this.orderNo}`);
        console.log(`주문 번호 ${this.orderNo}의 상세 내역:`, response.data);
        this.order = response.data;

        // 각 주문의 상세 내역을 가져옵니다.
        const detailsResponse = await axios.get(`/api/order-details/order/${this.orderNo}`);
        this.order.details = detailsResponse.data;
        console.log(`주문 상세 내역:`, detailsResponse.data);

        // 각 제품에 대한 상세 정보를 병렬로 가져옵니다.
        await Promise.all(this.order.details.map(async (detail) => {
          if (!this.products[detail.productId]) {
            const productResponse = await axios.get(`/api/products/detail/${detail.productId}`);
            console.log(`제품 ID ${detail.productId}의 상세 정보:`, productResponse.data);
            this.products[detail.productId] = productResponse.data;
          }
        }));

        // 모든 리뷰를 가져옵니다.
        await this.fetchReviews();
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      } finally {
        this.loading = false;
      }
    },
    async fetchReviews() {
      try {
        const response = await axios.get('/api/reviews/list'); // 새로운 엔드포인트 사용
        this.reviews = response.data;
        console.log("리뷰 테이블에서 불러온 정보:", this.reviews);
      } catch (error) {
        console.error('리뷰 데이터를 가져오는 데 실패했습니다:', error);
      }
    },
    hasReview(orderDetailNo) {
      return this.reviews.some(review => review.orderDetailNo === orderDetailNo);
    },
    getProductName(productId) {
      return this.products[productId] ? this.products[productId].productName : 'Loading...';
    },
    getProductImage(productId) {
      if (this.products[productId]) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.products[productId].productImage, 'text/html');
        const imgTag = doc.querySelector('img');
        return imgTag ? imgTag.src : '';
      }
      return '';
    },
    formatDate(dateString) {
      const options = { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      const date = new Date(dateString);
      return `${date.toLocaleDateString('ko-KR', options).replace(/\./g, '.').replace(/\s/g, '').slice(0, -1)} 주문`;
    },
    goToReviewPage(order, detail) {
      const queryParams = {
        orderNo: order.orderNo,
        orderDate: order.orderDate,
        productId: detail.productId,
        productName: this.getProductName(detail.productId),
        productImage: this.getProductImage(detail.productId),
        orderDetailNo: detail.orderDetailNo // orderDetailNo 추가
      };
      console.log("ReviewCreate 페이지로 넘기는 정보:", queryParams);

      this.$router.push({
        name: 'ReviewCreate',
        query: queryParams
      });
    },
    goToReviewDetail(order, detail) {
      const review = this.reviews.find(review => review.orderDetailNo === detail.orderDetailNo);
      if (review) {
        const queryParams = {
          reviewId: review.reviewId,
          orderNo: order.orderNo,
          orderDate: order.orderDate,
          productId: detail.productId,
          productName: this.getProductName(detail.productId),
          productImage: this.getProductImage(detail.productId),
          orderDetailNo: detail.orderDetailNo.toString(), // orderDetailNo를 문자열로 변환
          reviewContent: review.reviewContent,
          rating: review.rating
        };
        console.log("ReviewDetail 페이지로 넘기는 정보:", queryParams);

        this.$router.push({
          name: 'ReviewDetail',
          query: queryParams
        });
      }
    },
    goToReturnPage(order, detail, requestType) {
      this.$router.push({
        name: 'RefundCreate', // 기존 ReturnCreate를 RefundCreate로 변경
        query: {
          orderNo: order.orderNo,
          orderDate: order.orderDate,
          productId: detail ? detail.productId : null,
          productName: detail ? this.getProductName(detail.productId) : null,
          productImage: detail ? this.getProductImage(detail.productId) : null,
          orderDetailNo: detail ? detail.orderDetailNo : null,
          requestType: requestType,
          refundAmount: detail ? detail.amount : null // 환불 금액을 쿼리 파라미터로 전달
        }
      });
    },
    async addToCart(productId, quantity) {
    try {
      const cartItem = {
        productId,
        productQuantity: quantity
      };

      const response = await this.$store.dispatch('cart/addToCart', cartItem);
      if (response.status === 201) {
        console.log('Product added to cart successfully:', productId);
        this.$router.push({ name: 'Cart' }); // 장바구니 페이지로 이동
      } else {
        console.error('Failed to add product to cart:', productId);
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }}
  },
  async created() {
    console.log("OrderDetail created with orderNo:", this.orderNo);
    await this.fetchOrderDetails();
  }
};
</script>

<style scoped>
  .main-container {
    padding: 0;
    margin-top: 5px;
  }


</style>