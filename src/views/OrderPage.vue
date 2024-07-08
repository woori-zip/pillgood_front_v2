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
      <button @click="submitOrder" class="order-button btn btn-green">주문하기</button>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    name: 'OrderPage',
    data() {
        return {
            ownedCouponId: '', // 초기 선택값을 빈 문자열로 설정
            recipient: '',
            postalCode: '',
            address: '',
            detailedAddress: '',
            phoneNumber: '',
            orderRequest: '',
            subscriptionStatus: false,
            discountAmount: 0, // 할인 금액 추가
            shippingFee: 0, // 배송비 추가
            totalAmount: 0, // 총 금액
        };
    },
    computed: {
        ...mapState('order', {
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
        this.setRecipientAndPhoneNumber();
        this.calculateTotalAmount();
    },
    methods: {
        ...mapActions('order', ['fetchUserProfile', 'fetchCoupons', 'fetchOrderDetails', 'placeOrder']),
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
        async submitOrder() {
            try {
                const orderDetails = {
                    items: this.items,
                    totalAmount: this.totalAmount,
                    recipient: this.recipient,
                    postalCode: this.postalCode,
                    address: this.address,
                    detailedAddress: this.detailedAddress,
                    phoneNumber: this.phoneNumber,
                    orderRequest: this.orderRequest,
                    ownedCouponId: this.ownedCouponId || null, // null로 설정
                    subscriptionStatus: this.subscriptionStatus
                };
                const response = await this.placeOrder(orderDetails);
                if (response.status === 201) {
                    alert('주문이 완료되었습니다.');
                    this.$router.push('/'); // 주문 완료 후 홈으로 이동
                } else {
                    console.error('주문 실패:', response);
                    alert('주문 중 오류가 발생했습니다. 다시 시도하세요.');
                }
            } catch (error) {
                console.error('주문 에러: ', error);
                alert('주문 중 오류가 발생했습니다. 다시 시도하세요.');
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
        }
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
</style>
