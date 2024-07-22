<template>
  <div class="main-container">
    <div class="box-container-no-shade">
      <!-- 주문 상세 -->
      <div v-if="order" class="box-container">
        <h4 class="text-melon">상세 정보</h4>
        <div class="container">
          주문 일자: <strong>{{ formatDate(order.orderDate) }}</strong> | 주문 번호: <strong>{{ order.orderNo }}</strong>
        </div>
        <div class="table-container">
          <table class="line-table">
            <colgroup>
              <col style="width:30%">
              <col style="width:20%">
              <col style="width:10%">
              <col style="width:20%">
              <col style="width:20%">
            </colgroup>
            <thead>
              <tr>
                <th>제품명</th>
                <th>판매가</th>
                <th>수량</th>
                <th>구매가</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="detail in orderDetails" :key="detail.orderDetailNo">
                <td>
                  <img :src="getProductImage(detail.productId)" alt="Product Image" class="product-image">
                  <strong>{{ getProductName(detail.productId) }}</strong>
                </td>
                <td>{{ getProductPrice(detail.productId) }} 원</td>
                <td>{{ detail.quantity }}</td>
                <td>{{ calculateTotalAmount(detail) }} 원</td>
                  <div class="btn-container">
                    <td v-if="order.orderStatus === '구매확정'">
                  <button v-if="hasReview(detail.orderDetailNo)" class="btn btn-green" @click="goToReviewDetail(order, detail)">내 리뷰 보기</button>
                  <button v-else class="btn btn-green" @click="goToReviewPage(order, detail)">리뷰쓰기</button>
                  <button class="btn btn-gray" @click="addToCart(detail.productId, 1)">재구매</button>
              </td>
              <td v-else>
                <button class="btn btn-green" @click="confirmPurchase(order.orderNo)">구매확정</button>
                <button class="btn btn-gray" @click="goToReturnPage(order)">환불요청</button>
              </td>
                  </div>
              </tr>
            </tbody>
          </table>
        </div>
        <hr class="line">
        <h4 class="text-melon" style="text-align: left; margin-left: 10px;">배송지 정보</h4>
        <div>
          <table class="line-table">
            <colgroup>
              <col style="width:30%">
              <col style="width:70%">
            </colgroup>
            <tr>
              <td>수령인</td>
              <td>(수령인 이름)</td>
            </tr>
            <tr>
              <td>연락처</td>
              <td>연락처</td>
            </tr>
            <tr>
              <td>주소</td>
              <td>주소</td>
            </tr>
          </table>
        </div>
        <hr class="line">
        <h4 class="text-melon" style="text-align: left; margin-left: 10px;">결제 정보</h4>
        <div>
          <table class="line-table">
            <tr>
              <td>주문 금액</td>
              <td>쿠폰 할인 금액</td>
              <td>포인트 결제</td>
            </tr>
            <tr>
              <td colspan="3">총 결제 금액</td>
            </tr>
          </table>
        </div>
        <hr class="line">
        <div class="btn-container">
          <button class="btn btn-green" @click="$router.go(-1)">목록으로</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '../axios';
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
      orderDetails: [],
      products: {}, // 제품 정보를 저장할 객체
      reviews: [], // 리뷰 정보를 저장할 배열
      loading: true,
    };
  },
  methods: {
    ...mapActions('cart', ['addToCart']),
    async fetchOrderDetails() {
      console.log('Order No in fetchOrderDetails:', this.orderNo);
      if (!this.orderNo) {
        console.error('orderNo prop이 전달되지 않았습니다.');
        return;
      }
      try {
        const response = await axios.get(`/api/orders/${this.orderNo}`);
        console.log(`주문 번호 ${this.orderNo}의 상세 내역:`, response.data);
        this.order = response.data;

        const detailsResponse = await axios.get(`/api/order-details/order/${this.orderNo}`);
        this.orderDetails = detailsResponse.data;

        await Promise.all(this.orderDetails.map(async (detail) => {
          if (!this.products[detail.productId]) {
            const productResponse = await axios.get(`/api/products/detail/${detail.productId}`);
            this.products[detail.productId] = productResponse.data;
          }
        }));

        await this.fetchReviews();
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      } finally {
        this.loading = false;
      }
    },
    async fetchReviews() {
      try {
        const response = await axios.get('/api/reviews/list');
        this.reviews = response.data;
      } catch (error) {
        console.error('리뷰 데이터를 가져오는 데 실패했습니다:', error);
      }
    },
    hasReview(orderDetailNo) {
      return this.reviews.some(review => review.orderDetailNo === orderDetailNo);
    },
    getProductName(productId) {
      const product = this.products[productId];
      console.log('Product details for getProductName:', product); // 제품 정보 출력
      return product ? product.productName : 'Loading...';
    },
    getProductPrice(productId) {
      const product = this.products[productId];
      console.log('Product details for getProductPrice:', product); // 제품 정보 출력
      return product ? product.price : 'Loading...';
    },
    calculateTotalAmount(detail) {
      const product = this.products[detail.productId];
      console.log('Product details for calculateTotalAmount:', product); // 제품 정보 출력
      return product ? (product.price * detail.quantity) : 'Loading...';
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
      const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', options).replace(/\./g, '.');
    },
    async confirmPurchase(orderNo) {
    try {
      await axios.put(`/api/orders/update-status/${orderNo}`, { status: '구매확정' });
      this.order.orderStatus = '구매확정'; // 주문 상태를 업데이트
    } catch (error) {
      console.error('Failed to confirm purchase:', error);
    }
  },
    goToReviewPage(order, detail) {
      const queryParams = {
        orderNo: order.orderNo,
        orderDate: order.orderDate,
        productId: detail.productId,
        productName: this.getProductName(detail.productId),
        productImage: this.getProductImage(detail.productId),
        orderDetailNo: detail.orderDetailNo
      };
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
          orderDetailNo: detail.orderDetailNo.toString(),
          reviewContent: review.reviewContent,
          rating: review.rating
        };
        this.$router.push({
          name: 'ReviewDetail',
          query: queryParams
        });
      }
    },
    goToReturnPage(order, detail, requestType) {
      this.$router.push({
        name: 'RefundCreate',
        query: {
          orderNo: order.orderNo,
          orderDate: order.orderDate,
          productId: detail ? detail.productId : null,
          productName: detail ? this.getProductName(detail.productId) : null,
          productImage: detail ? this.getProductImage(detail.productId) : null,
          orderDetailNo: detail ? detail.orderDetailNo : null,
          requestType: requestType,
          refundAmount: detail ? detail.amount : null
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
          this.$router.push({ name: 'Cart' });
        } else {
          console.error('Failed to add product to cart:', productId);
        }
      } catch (error) {
        console.error('Error adding product to cart:', error);
      }
    }
  },
  async created() {
    console.log('Order No in created:', this.orderNo);
    await this.fetchOrderDetails();
  }
};
</script>

<style scoped>
.text-melon {
  text-align: left;
  margin-left: 10px;
}
.line-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.line-table th, .line-table td {
  padding: 10px;
  text-align: left;
  text-align: center;
  word-wrap: break-word;
}

.line-table img {
  max-width: 50px;
  max-height: 50px;
  margin-right: 10px;
}

.main-container {
  padding: 0;
  margin-top: 5px;
}

.box-container {
  margin-top: 20px;
   display: flex;
  flex-direction: column;
  align-items: center;
}

.container {
  display: flex;
  text-align: center;
  padding: 15px;
  border: 2px solid #EBF7F0;
  border-radius: 10px;
  white-space: nowrap;
  margin-bottom: 20px;
}

.btn-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (min-width: 1200px) {
  .line-table {
  width: 100%;
}

.line-table tr, td {
  padding: 30px;
}

.line-table img {
  max-width: 100px;
  max-height: 100px;
  margin-right: 10px;
}

.main-container {
  padding: 0;
  margin-top: 5px;
}

.box-container {
  margin-top: 20px;
}

.container {
  display: inline-block;
  text-align: left;
  padding: 15px;
  border: 2px solid #EBF7F0;
  border-radius: 10px;
  margin: 20px;
  white-space: nowrap;
}

.btn-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
}
</style>
