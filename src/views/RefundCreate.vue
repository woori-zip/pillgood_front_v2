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
import axios from '../axios'; // 'axios.js' 설정 파일을 import

export default {
  props: {
    refundAmount: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      orderNo: this.$route.query.orderNo, // 주문번호는 라우트에서 받아옴
      requestType: this.$route.query.requestType || '반품', // 라우트에서 요청 타입을 받아옴
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
        refundCompleteDate: null, // 환불 완료 날짜는 초기에는 null로 설정
        orderDate: this.$route.query.orderDate,
        totalRefundAmount: this.refundAmount,
        refundMethod: this.requestType, // 반품 또는 교환
        refundBank: this.bankName,
        refundAccount: this.accountNumber,
        accountHolder: this.accountHolder,
        refundStatus: 'pending', // 초기 상태는 'pending'
        orderNo: this.orderNo,
        userId: this.$store.state.member.id // 사용자 ID 추가
      };

      try {
        const response = await axios.post('/api/refunds/create', refundData);
        console.log('환불 정보가 성공적으로 저장되었습니다:', response.data);
        this.$router.push('/refunddetail'); // 환불 상세 페이지로 이동
      } catch (error) {
        console.error('환불 정보 저장 중 오류가 발생했습니다:', error);
      }
    }
  }
};
</script>

<style scoped>
/* 기존 스타일 건드리지 않음 */
</style>
