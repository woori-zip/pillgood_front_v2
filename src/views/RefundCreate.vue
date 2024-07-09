<template>
  <div class="main-container">
    <div class="box-container box-shadow">
      <h2 class="order-no">{{ orderNo }}</h2>
      <div class="return-exchange-info">
        <div class="return-exchange-title">
          교환/반품 안내
        </div>
        <p class="return-exchange-description">
          교환 및 반품 신청 페이지에 모든 항목을 기재하신 후, 상품을 우체국으로 이용해 착불로 보내주세요.
        </p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group check-container">
          <label><input type="radio" v-model="requestType" value="반품"> 반품</label>
          <label><input type="radio" v-model="requestType" value="교환"> 교환</label>
        </div>
        
        <div class="form-group">
          <label>상세 사유 입력 (선택사항)</label>
          <textarea v-model="detailedReason" @focus="clearTextArea"></textarea>
        </div>
        
        <div class="form-group">
          <label>은행명</label>
          <input v-model="bankName" type="text">
        </div>
        
        <div class="form-group">
          <label>계좌번호</label>
          <input v-model="accountNumber" type="text">
        </div>
        
        <div class="form-group">
          <label>예금주</label>
          <input v-model="accountHolder" type="text">
        </div>
        
        <div class="right-column">
          <div class="form-group">
            <label>반품 상품 선택</label>
            <!-- 반품 상품 선택 UI 추가 -->
          </div>
          
          <div class="form-group">
            <label>환불 예정 금액</label>
            <p>{{ refundAmount }}원</p>
          </div>
        </div>

        <button class="btn btn-green" type="submit">제출</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from '../axios';

export default {
  props: {
    refundAmount: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      orderNo: this.$route.query.orderNo,
      requestType: this.$route.query.requestType || '반품',
      detailedReason: '상세 사유는 선택사항입니다.',
      bankName: '',
      accountNumber: '',
      accountHolder: ''
    };
  },
  methods: {
    clearTextArea() {
      if (this.detailedReason === '상세 사유는 선택사항입니다.') {
        this.detailedReason = '';
      }
    },
    async handleSubmit() {
      const refundData = {
        refundRequestDate: new Date(),
        refundCompleteDate: null,
        orderDate: this.$route.query.orderDate,
        totalRefundAmount: this.refundAmount,
        refundMethod: this.requestType,
        refundBank: this.bankName,
        refundAccount: this.accountNumber,
        accountHolder: this.accountHolder,
        refundStatus: '환불대기',
        orderNo: this.orderNo,
        userId: this.$store.state.member.id
      };

      try {
        const response = await axios.post('/api/refunds/create', refundData);
        console.log('환불 정보가 성공적으로 저장되었습니다:', response.data);
        this.$router.push({ name: 'RefundDetail', params: { orderNo: refundData.orderNo } }); // 수정된 부분
      } catch (error) {
        console.error('환불 정보 저장 중 오류가 발생했습니다:', error);
      }
    }
  }
};
</script>

<style scoped>
.main-container {
  padding: 20px;
}
</style>
