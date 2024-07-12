<template>
  <div class="main-container box-shadow">
    <h4 class="order-title text-melon">주문 페이지</h4>
    <div class="order-items">
      <div class="order-item" v-for="item in items" :key="item.productId">
        <div class="item-details">
          <img :src="item.productImage" alt="Product Image" class="product-image" />
          <div class="item-name">상품 이름: {{ item.productName }}</div>
          <div class="item-quantity">수량: {{ item.productQuantity }}</div>
          <div class="item-price">{{ item.price * item.productQuantity }} 원</div>
        </div>
      </div>
    </div>
    <div class="input-group">
      <label for="ownedCouponId">쿠폰</label>
      <select id="ownedCouponId" v-model="ownedCouponId" @change="applyCoupon">
        <option value="">보유중인 쿠폰 선택하기</option>
        <option v-for="coupon in coupons" :key="coupon.ownedCouponId" :value="coupon.ownedCouponId">
          {{ coupon.couponName }}
        </option>
      </select>
      <p v-if="coupons.length === 0">보유중인 쿠폰이 없습니다.</p>
    </div>
    <p>3만원 이상 구매시 배송비 무료</p>
    <div class="shipping-fee">배송비: {{ shippingFeeMessage }}</div>
    <div class="total-amount">총 금액: {{ totalAmount }} 원</div>
    <div class="order-details">
      <h4 class="section-title">배송정보</h4>
      <div class="input-group">
        <label for="recipient">수령인 이름</label>
        <input type="text" id="recipient" v-model="recipient" />
      </div>
      <div class="input-group">
        <label for="phoneNumber">수령인 연락처</label>
        <input type="text" id="phoneNumber" v-model="phoneNumber" />
      </div>
      <div class="input-group postal-code-group">
        <label for="postalCode">우편번호</label>
        <div class="postal-code-input">
          <input type="text" id="postalCode" v-model="postalCode" class="postal-code-field" readonly />
          <button @click="openDaumPostcode" class="btn btn-gray">우편번호 검색</button>
        </div>
        <div ref="wrap" style="display:none;border:1px solid;width:500px;height:300px;margin:5px 0;position:relative">
          <img src="//t1.daumcdn.net/postcode/resource/images/close.png" id="btnFoldWrap" style="cursor:pointer;position:absolute;right:0px;top:-1px;z-index:1" @click="foldDaumPostcode" alt="접기 버튼">
        </div>
      </div>
      <div class="input-group">
        <label for="address">도로명 주소</label>
        <input type="text" id="address" v-model="address" readonly />
      </div>
      <div class="input-group">
        <label for="detailedAddress">나머지 주소</label>
        <input type="text" id="detailedAddress" v-model="detailedAddress" />
      </div>
      <div class="input-group">
        <label for="orderRequest">배송 요청사항</label>
        <input type="text" id="orderRequest" v-model="orderRequest" placeholder="배송 요청사항 입력해 주세요." />
      </div>
      <div class="subscription-options">
        <label>
          <input type="radio" v-model="subscriptionStatus" :value="true" />
          <span class="subscription-button">정기구독</span>
        </label>
        <label>
          <input type="radio" v-model="subscriptionStatus" :value="false" />
          <span class="subscription-button">한번만 구매하기</span>
        </label>
      </div>
    </div>
    <div id="payment-method" class="w-100"></div>
    <div id="agreement" class="w-100"></div>
    <button id="payment-request-button" @click="preparePayment" class="order-button btn btn-green">결제하기</button>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import axios from '../axios';

export default {
  name: 'OrderPage',
  data() {
    return {
      ownedCouponId: '',
      recipient: '',
      postalCode: '',
      address: '',
      detailedAddress: '',
      phoneNumber: '',
      orderRequest: '',
      subscriptionStatus: false,
      discountAmount: 0,
      shippingFee: 0,
      totalAmount: 0,
      tossPayments: null,
      paymentWidget: null,
      currentOrderId: null, // 현재 주문 ID를 저장합니다.
    };
  },
  computed: {
    ...mapGetters('member', ['memberId']),
    ...mapState('order', {
      isLoggedIn: state => state.isLoggedIn,
      items: state => state.orderDetails,
      user: state => state.userProfile,
      coupons: state => state.coupons,
    }),
    shippingFeeMessage() {
      return this.shippingFee === 0 ? '무료' : `+${this.shippingFee} 원`;
    }
  },
  async created() {
    await this.fetchUserProfile();
    await this.fetchCoupons();
    await this.fetchOrderDetails();
    await this.fetchBillingKey(); // billingKey 가져오기
    this.setRecipientAndPhoneNumber();
    this.calculateTotalAmount();
  },
  methods: {
    ...mapActions('order', ['fetchUserProfile', 'fetchCoupons', 'fetchOrderDetails', 'placeOrder']),
    ...mapActions('billing', ['fetchBillingKey']),
    applyCoupon() {
      const selectedCoupon = this.coupons.find(coupon => coupon.ownedCouponId === this.ownedCouponId);
      this.discountAmount = selectedCoupon ? selectedCoupon.discountAmount : 0;
      this.calculateTotalAmount();
    },
    calculateTotalAmount() {
      const subtotal = this.items.reduce((total, item) => total + item.price * item.productQuantity, 0);
      this.shippingFee = subtotal >= 30000 ? 0 : 3000;
      this.totalAmount = subtotal - this.discountAmount + this.shippingFee;
    },
    setRecipientAndPhoneNumber() {
      if (this.user) {
        this.recipient = this.user.name;
        this.phoneNumber = this.user.phoneNumber;
      }
    },
    async preparePayment() {
      const orderDetails = {
        items: this.items,
        totalAmount: this.totalAmount,
        recipient: this.recipient,
        postalCode: this.postalCode,
        address: this.address,
        detailedAddress: this.detailedAddress,
        phoneNumber: this.phoneNumber,
        orderRequest: this.orderRequest,
        ownedCouponId: this.ownedCouponId || null,
        subscriptionStatus: this.subscriptionStatus
      };

      try {
        const orderResponse = await this.placeOrder(orderDetails);
        if (orderResponse.status === 201) {
          this.$store.commit('order/setCurrentOrder', { ...orderResponse.data, totalAmount: this.totalAmount }); // 현재 주문 정보와 최종 금액을 저장합니다.
          console.log('Current Order:', this.$store.state.order.currentOrder); // 로깅 추가
          
          if (this.subscriptionStatus) {
              await this.initializeTossPayments();
              this.setupBillingAuth(this.currentOrderId);
          } else {
            await this.initializeTossPayments();
            this.setupTossPayments(this.currentOrderId); // 일반 결제
          }
        } else {
          console.error('주문 생성 실패:', orderResponse);
          alert('주문 생성 중 오류가 발생했습니다. 다시 시도하세요.');
        }
      } catch (error) {
        console.error('결제 준비 중 오류:', error);
        alert('결제 준비 중 오류가 발생했습니다. 다시 시도하세요.');
      }
    },
    initializeTossPayments() {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://js.tosspayments.com/v1/payment';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },
    async setupTossPayments(orderId) {
      const clientKey = await this.fetchClientKey();
      if (!clientKey) {
        console.error('Client key is not defined');
        return;
      }

      if (!window.TossPayments) {
        console.error('TossPayments is not loaded');
        return;
      }

      this.tossPayments = window.TossPayments(clientKey);

      const paymentRequest = {
        amount: this.totalAmount,
        orderId: orderId,
        orderName: 'Order Name',
        customerName: this.recipient,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`
      };

      try {
        const response = await this.tossPayments.requestPayment('카드', paymentRequest);
        const paymentKey = response.paymentKey;
        const successUrl = `${window.location.origin}/payment/success?orderId=${orderId}&amount=${this.totalAmount}&paymentKey=${paymentKey}`;
        window.location.href = successUrl; // 결제 성공 페이지로 이동
      } catch (error) {
        console.error('결제 요청 오류:', error);
        alert('결제 요청 중 오류가 발생했습니다. 다시 시도하세요.');
        await this.cancelOrder(orderId); // 결제 요청 오류 발생 시 주문을 취소합니다.
      }
    },
    async setupBillingAuth(orderId) {
      const clientKey = await this.fetchClientKey();
      if (!clientKey) {
        console.error('Client key is not defined');
        return;
      }

      if (!window.TossPayments) {
        console.error('TossPayments is not loaded');
        return;
      }

      this.tossPayments = window.TossPayments(clientKey);

      try {
        await this.tossPayments.requestBillingAuth('카드', {
          customerKey: this.memberId, // 구매자 ID
          successUrl: `${window.location.origin}/payment/card`,
          failUrl: `${window.location.origin}/payment/fail`
        });

        // authKey는 successUrl로 이동하면서 전달됨
      } catch (error) {
        if (error.code === 'USER_CANCEL') {
          console.log('결제 고객이 결제창을 닫았습니다.');
          await this.cancelOrder(orderId); // 결제 취소 시 주문을 취소합니다.
        } else {
          console.error('결제 요청 오류:', error);
          alert('결제 요청 중 오류가 발생했습니다. 다시 시도하세요.');
          await this.cancelOrder(orderId); // 결제 요청 오류 발생 시 주문을 취소합니다.
        }
      }
    },
    async fetchClientKey() {
      try {
        const response = await axios.get('/api/payment/client-key');
        return response.data.clientKey;
      } catch (error) {
        console.error('Failed to fetch client key:', error);
      }
    },
    async cancelOrder(orderNo) {
      try {
        await axios.delete(`/api/orders/cancel/${orderNo}`, { withCredentials: true });
        alert('주문이 취소되었습니다.');
      } catch (error) {
        console.error('주문 취소 중 오류 발생:', error);
        alert('주문 취소 중 오류가 발생했습니다. 다시 시도하세요.');
      }
    },
    openDaumPostcode() {
      const elementWrap = this.$refs.wrap;
      const currentScroll = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
      new window.daum.Postcode({
        oncomplete: (data) => {
          let addr = '';
          if (data.userSelectedType === 'R') {
            addr = data.roadAddress;
          } else {
            addr = data.jibunAddress;
          }
          this.postalCode = data.zonecode;
          this.address = addr;
          elementWrap.style.display = 'none';
          document.body.scrollTop = currentScroll;
        },
        onresize: (size) => {
          elementWrap.style.height = size.height + 'px';
        },
        width: '100%',
        height: '100%'
      }).embed(elementWrap);
      elementWrap.style.display = 'block';
    },
    foldDaumPostcode() {
      const elementWrap = this.$refs.wrap;
      elementWrap.style.display = 'none';
    },
  },
  watch: {
    ownedCouponId(newVal) {
      if (newVal === '') {
        this.discountAmount = 0;
      }
      this.applyCoupon();
    }
  }
};
</script>

<style scoped>
.order-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.order-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.order-items {
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.item-details {
  display: flex;
  flex-direction: column;
}

.item-name,
.item-quantity,
.item-price {
  font-size: 1rem;
  margin-bottom: 5px;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.shipping-fee {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.input-group label {
  font-size: 1rem;
  text-align: left;
  margin-bottom: 5px;
}

.input-group input, .input-group select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  width: 100%;
  text-align: left;
}

.postal-code-group {
  display: flex;
  gap: 10px;
}

.postal-code-input {
  display: flex;
  width: 100%;
  gap: 10px;
}

.postal-code-field {
  text-align: left;
}

.btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f5f5f5;
  cursor: pointer;
}

.btn:hover {
  background-color: #ddd;
}

.subscription-options {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  margin-bottom: 20px;
}

.subscription-options label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.subscription-options input[type="radio"] {
  display: none;
}

.subscription-button {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 20px;
  background-color: #ddd;
  color: #333;
  transition: background-color 0.3s;
}

.subscription-options input[type="radio"]:checked + .subscription-button {
  background-color: #5cb85c;
  color: white;
}

.order-button {
  width: 100%;
  padding: 10px;
  background-color: #5cb85c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.order-button:hover {
  background-color: #4cae4c;
}

.product-image {
  width: 200px;
  height: 200px;
}

.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
</style>
