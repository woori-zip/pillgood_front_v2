<template>
  <div class="main-container">
    <h2 class="text-melon">주문하기</h2>
    <div class="box-container">
    <table class="line-table">
    <thead>
      <tr>
        <th>상품 정보</th>
        <th>수량</th>
        <th>가격</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.productId">
        <td class="item-info" colspan="2"><div class="item-image"><img :src="item.productImage" alt="Product Image" /></div>
        {{ item.productName }}</td>
        <td>{{ item.productQuantity }}</td>
        <td>{{ item.price * item.productQuantity }} 원</td>
      </tr>
    </tbody>
  </table>
  <div style="display: flex; align-items: flex-end; flex-direction: column; margin-top: 10px;">
    <h6>배송비 {{ shippingFeeMessage }}</h6>
    <hr style="width: 200px">
    <h4 class="text-melon">합계: {{ totalAmount }} 원</h4>
  </div>
  <hr class="line">

  <div class="box-container-no-shade">
    <label for="ownedCouponId"><h4 class="text-melon">쿠폰 / 포인트 사용</h4></label>
    <select id="ownedCouponId" v-model="ownedCouponId" @change="applyCoupon">
      <option value="">보유중인 쿠폰 선택하기</option>
      <option v-for="coupon in coupons" :key="coupon.ownedCouponId" :value="coupon.ownedCouponId">
        {{ coupon.couponName }}
      </option>
    </select>
    <p v-if="coupons.length === 0">보유중인 쿠폰이 없습니다.</p>
  </div>
  <div class="box-container-no-shade btn-container">
    <div class="point-wrapper">
    <input type="number" id="usePoints" v-model.number="usePoints" :readonly="pointsApplied" /> P&nbsp;/&nbsp;<span style="color: red">{{ totalPoints }}</span>&nbsp;P&nbsp;  
    <button @click="applyPoints" :disabled="pointsApplied || usePoints < 1000" class="btn btn-green" style="height: 30px">적용하기</button></div>
    <span class="text-info">포인트는 최소 1000 포인트 보유 시, 1000 포인트 이상 사용 가능합니다.</span>
    <span v-if="pointsError" class="text-danger">{{ pointsError }}</span>
  </div>

  <hr class="line" style="background: white">

  <div style="display: flex; align-items: flex-end; flex-direction: column;">
    <h6>(3만원 이상 구매시 배송비 무료)</h6>
    <h4 class="text-melon">총 결제액: {{ totalAmount }} 원</h4>
  </div>

  <hr class="line">

  <div class="order-details">
    <h4 class="text-melon">배송 정보</h4>
    <table class="line-table" style="padding: 10px">
      <colgroup>
        <col style="width:170px">
        <col style="width:*">
      </colgroup>
      <tbody>
        <tr>
          <td style="text-align: left;">배송지 선택</td>
          <td>
            <div class="radio-container">
              <input type="radio" id="existingAddress" value="existing" v-model="addressType" />
              <label for="existingAddress">기존 배송지</label>
              <input type="radio" id="newAddress" value="new" v-model="addressType" />
              <label for="newAddress">새로운 배송지</label>
            </div>
          </td>
        </tr>
        <tr v-if="addressType === 'existing'">
          <td style="text-align: left;">배송지명</td>
          <td>
            <select v-model="selectedAddress">
              <option v-for="address in addresses" :key="address.id" :value="address">{{ address.name }}</option>
            </select>
          </td>
        </tr>
        <tr v-if="addressType === 'new'">
          <td style="text-align: left;"><label for="recipient">수령인 이름</label></td>
          <td>
            <input type="text" id="recipient" v-model="recipient" @input="validateRecipient" />
            <p v-if="errors.recipient" class="error">{{ errors.recipient }}</p>
          </td>
        </tr>
        <tr v-if="addressType === 'new'">
          <td style="text-align: left"><label for="phoneNumber">수령인 연락처</label></td>
          <td>
            <input type="text" id="phoneNumber" v-model="phoneNumber" @input="validatePhoneNumber" />
            <p v-if="errors.phoneNumber" class="error">{{ errors.phoneNumber }}</p>
          </td>
        </tr>
        <tr class="postal-code-group" v-if="addressType === 'new'">
          <td style="text-align: left"><label for="postalCode">주소</label></td>
          <td>
            <div class="postal-code-input">
              <input type="text" id="postalCode" v-model="postalCode" class="postal-code-field" readonly />
              <button @click="openDaumPostcode" class="btn btn-green" style="display: inline-block; white-space: nowrap;">우편 번호 찾기</button>
            </div>
            <div ref="wrap" style="display:none;border:1px solid;width:500px;height:300px;margin:5px 0;position:relative">
              <img src="//t1.daumcdn.net/postcode/resource/images/close.png" id="btnFoldWrap" style="cursor:pointer;position:absolute;right:0px;top:-1px;z-index:1" @click="foldDaumPostcode" alt="접기 버튼">
            </div>
            <input type="text" id="address" v-model="address" readonly />
            <p v-if="errors.address" class="error">{{ errors.address }}</p>
            <input type="text" id="detailedAddress" v-model="detailedAddress" @input="validateDetailedAddress" />
            <p v-if="errors.detailedAddress" class="error">{{ errors.detailedAddress }}</p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left"><label for="orderRequest">배송 요청사항</label></td>
          <td>
            <input type="text" id="orderRequest" v-model="orderRequest" placeholder=" 배송 요청 사항을 입력해 주세요." />
          </td>
        </tr>
      </tbody>
    </table>

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
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import axios from '../axios';
import '../assets/styles.css';

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
      usePoints: 0,
      pointsApplied: false,
      pointsError: '',
      totalPoints: 0,
      tossPayments: null,
      paymentWidget: null,
      currentOrderId: null, // 현재 주문 ID를 저장합니다.
      addressType: 'existing', // 기본값을 기존 배송지로 설정
      addresses: [], // 기존 배송지 목록
      selectedAddress: null, // 선택된 기존 배송지
      errors: {
        recipient: '',
        phoneNumber: '',
        address: '',
        detailedAddress: ''
      }
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
    ...mapState('billing', ['billingKey']), // billingStore에서 billingKey 가져오기
    shippingFeeMessage() {
      return this.shippingFee === 0 ? '무료' : `+${this.shippingFee} 원`;
    }
  },
  async created() {
    await this.fetchUserProfile();
    await this.fetchCoupons();
    await this.fetchOrderDetails();
    await this.fetchBillingKey();
    this.setRecipientAndPhoneNumber();
    this.calculateTotalAmount();
    await this.fetchTotalPoints(); // 총 포인트 가져오기
    this.fetchAddresses(); // 기존 배송지 목록을 가져오는 함수 호출
  },
  methods: {
    ...mapActions('order', ['fetchUserProfile', 'fetchCoupons', 'fetchOrderDetails', 'placeOrder']),
    ...mapActions('billing', ['fetchBillingKey']),
    async fetchTotalPoints() {
      try {
        const response = await axios.get('/api/points/totalPoints', { withCredentials: true });
        this.totalPoints = response.data;
      } catch (error) {
        console.error('Error fetching total points:', error);
      }
    },
    fetchAddresses() {
      // API 호출 또는 데이터를 가져오는 로직
      this.addresses = [
        { id: 1, name: '배송지1', recipient: '홍길동', phoneNumber: '010-1234-5678', postalCode: '12345', address: '서울시 강남구', detailedAddress: '역삼동 123-45' },
        { id: 2, name: '배송지2', recipient: '김철수', phoneNumber: '010-8765-4321', postalCode: '54321', address: '서울시 서초구', detailedAddress: '서초동 67-89' }
      ];
    },
    applyCoupon() {
      const selectedCoupon = this.coupons.find(coupon => coupon.ownedCouponId === this.ownedCouponId);
      this.discountAmount = selectedCoupon ? selectedCoupon.discountAmount : 0;
      this.calculateTotalAmount();
    },
    calculateTotalAmount() {
      const subtotal = this.items.reduce((total, item) => total + item.price * item.productQuantity, 0);
      this.shippingFee = subtotal >= 30000 ? 0 : 3000;
      this.totalAmount = subtotal - this.discountAmount + this.shippingFee - this.usePoints;
    },
    setRecipientAndPhoneNumber() {
      if (this.user) {
        this.recipient = this.user.name;
        this.phoneNumber = this.user.phoneNumber;
      }
    },
    applyPoints() {
      if (this.usePoints < 1000) {
        this.pointsError = '포인트는 최소 1000포인트부터 사용 가능합니다.';
        return;
      }
      if (this.usePoints > this.totalPoints) {
        this.pointsError = '포인트가 부족합니다.';
        return;
      }
      this.pointsError = '';
      this.pointsApplied = true;
      this.calculateTotalAmount();
    },
    validateRecipient() {
      this.errors.recipient = this.recipient ? '' : '이름을 입력해주세요.';
    },
    validatePhoneNumber() {
      this.errors.phoneNumber = this.phoneNumber ? '' : '연락처를 입력해주세요.';
    },
    validateAddress() {
      if (this.postalCode && this.address) {
        this.errors.address = '';
      } else {
        this.errors.address = '주소를 등록해주세요.';
      }
    },
    validateDetailedAddress() {
      this.errors.detailedAddress = this.detailedAddress ? '' : '나머지 주소를 입력해주세요.';
    },
    validateForm() {
      this.validateRecipient();
      this.validatePhoneNumber();
      this.validateAddress();
      this.validateDetailedAddress();

      return !this.errors.recipient &&
        !this.errors.phoneNumber &&
        !this.errors.address &&
        !this.errors.detailedAddress;
    },
    async preparePayment() {
      if (!this.validateForm()) {
        return;
      }

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
        subscriptionStatus: this.subscriptionStatus,
        pointsToUse: this.usePoints // 포인트 사용 정보 추가
      };

      try {
        const orderResponse = await this.placeOrder(orderDetails);

        if (orderResponse.status === 201) {
          this.currentOrderId = orderResponse.data.orderNo;
          console.log('Current Order:', this.$store.state.order.currentOrder); // 로깅 추가
          // localStorage에 currentOrder 저장
          localStorage.setItem('currentOrder', JSON.stringify(this.$store.state.order.currentOrder));
          
          if (this.subscriptionStatus) {
              if(this.billingKey) {
                this.$router.push({ name: 'ApprovePayment' }); // 결제 성공 페이지로 이동
              } else {
                await this.initializeTossPayments();
                this.setupBillingAuth(this.currentOrderId); // 정기 결제
              }
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
          this.validateAddress(); // 주소 검색 후 유효성 검사
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
    }
  },
  watch: {
    ownedCouponId(newVal) {
      if (newVal === '') {
        this.discountAmount = 0;
      }
      this.applyCoupon();
    },
    recipient() {
      this.validateRecipient();
    },
    phoneNumber() {
      this.validatePhoneNumber();
    },
    detailedAddress() {
      this.validateDetailedAddress();
    },
    postalCode() {
      this.validateAddress();
    },
    address() {
      this.validateAddress();
    }
  }
};
</script>


<style scoped>
.item-info {
  height: 120px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.item-image{
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 30px;
  overflow: hidden;
  display: flex;
  align-items: center; /* 세로 중앙 정렬 */
  justify-content: center; /* 가로 중앙 정렬 */
  background: rgb(221, 220, 220);
}

.item-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.box-container-no-shade label, select, p {
  margin: 10px;
}

.btn-container {
  position: relative;
  display: inline-block;
}

.point-wrapper {
  white-space: nowrap;
  display: flex;
  align-items: center;

}

.text-info {
  font-size: 0.9em;
  color: gray
}

.postal-code-input {
  display: flex;
  align-items: center;
  width: 300px;
}

.postal-code-field {
  margin-right: 10px;
}

.btn {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
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
  background-color: #B4D9A9;
  color: white;
}

.order-button {
  width: 100%;
  padding: 10px;
  background-color: #B4D9A9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.order-button:hover {
  background-color: #B4D9A9;
}

.product-image {
  width: 200px;
  height: 200px;
}

.error {
  color: red;
  font-size: 12px;
  margin-top: 5px;
}

.radio-container {
 display: flex;
 align-items: center;
 justify-content: flex-start;
}

.radio-container label {
  margin-right: 20px; /* 라벨 사이의 간격 조절 */
}

.radio-container input[type="radio"] {
  width: 15px;
  height: 15px;
  margin-right: 5px; /* 라디오 버튼과 라벨 사이의 간격 조절 */
}

select {
  width: 100; /* select 요소의 너비를 부모 요소에 맞게 설정 */
  box-sizing: border-box; /* 패딩과 테두리를 포함한 너비 계산 */
  margin-left: 0;
}
</style>
