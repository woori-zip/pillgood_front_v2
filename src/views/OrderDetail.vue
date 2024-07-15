<template>
  <div class="main-container">
    <h1>주문 상세 내역</h1>

    <!-- 주문 상세 -->
    <div v-if="order" class="order-container box-shadow" style="padding:20px">
      <p style="text-align: left;">
        <span style="font-weight: bold; font-size: 20px;">{{ order.orderStatus }}</span> {{ order.orderNo }}
      </p>

      <!-- 주문상세 리스트 -->
      <div v-for="detail in order.details" :key="detail.orderDetailNo">
        <div style="display: flex">
          <img :src="getProductImage(detail.productId)" style="height: 100px; width: auto; border-radius: 15px; margin-right: 20px;">
          <div>
            <p style="text-align: left;">
              <span style="color:gray;">{{ formatDate(order.orderDate) }}</span><br>
              <span style="font-size:20px;">{{ getProductName(detail.productId) }}</span><br>
              <span style="font-size:20px; font-weight:bold">{{ detail.amount }}원</span><br>
              <a href="#">주문상세</a>
            </p>
          </div>
        </div>
        <!-- 구매확정 시 주문 상세 건별 버튼 -->
        <div class="btn-container">
          <button v-if="hasReview(detail.orderDetailNo)" class="btn btn-green" @click="goToReviewDetail(detail.orderDetailNo)">내 리뷰 보기</button>
          <button v-else class="btn btn-green" @click="goToReviewPage(order, detail)">리뷰쓰기</button>
          <button class="btn btn-gray">재구매</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from '../axios'; // 'axios.js' 설정 파일을 import

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
      this.$router.push({
        name: 'ReviewCreate',
        query: {
          orderNo: order.orderNo,
          orderDate: order.orderDate,
          productId: detail.productId,
          productName: this.getProductName(detail.productId),
          productImage: this.getProductImage(detail.productId),
          orderDetailNo: detail.orderDetailNo // orderDetailNo 추가
        }
      });
    },
    goToReviewDetail(orderDetailNo) {
      this.$router.push({
        name: 'ReviewDetail',
        params: {
          orderDetailNo: orderDetailNo
        }
      });
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
    }
  },
  async created() {
    console.log("OrderDetail created with orderNo:", this.orderNo);
    await this.fetchOrderDetails();
  }
};
</script>
