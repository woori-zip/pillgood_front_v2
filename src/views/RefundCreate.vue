<template>
  <div class="main-container">
    <div class="box-container box-shadow">
      <h2 class="text-melon">환불</h2>
      <div class="return-exchange-info">
        <div class="return-exchange-title">
          반품 및 환불 신청 페이지에 모든 항목을 기재하신 후, 상품을 우체국으로 이용해 착불로 보내주세요.
        </div>
      </div>
        
      <form @submit.prevent="handleSubmit">
        <div class="check-container">
          <label><input type="radio" v-model="requestType" value="반품"> 반품</label>
          <label><input type="radio" v-model="requestType" value="환불"> 환불</label>
        </div>
        <table class="line-table">
          <colgroup>
            <col style="width:30%">
            <col style="width:70%">
          </colgroup>
          <tr>
            <td>주문 번호</td>
            <td>{{ orderNo }}</td>
          </tr>
          <tr>
            <td>사유</td>
            <td>
              <rich-text-editor v-model="detailedReason" ref="richTextEditor" @text-change="handleTextChange"></rich-text-editor>
            </td>
          </tr>
          <tr>
            <td><label>은행명</label></td>
            <td><input v-model="bankName" type="text"></td>
          </tr>
          <tr>
            <td><label>계좌번호</label></td>
            <td><input v-model="accountNumber" type="text"></td>
          </tr>
          <tr>
            <td><label>예금주</label></td>
            <td><input v-model="accountHolder" type="text"></td>
          </tr>
        </table>
        <div class="btn-container">
          <button class="btn btn-green" type="submit">제출</button>
          <button class="btn btn-gray" @click="goOrderHistory">돌아가기</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from '../axios';
import RichTextEditor from '@/components/RichTextEditor.vue';
import '../assets/styles.css';

export default {
  props: {
    refundAmount: {
      type: Number,
      required: true
    }
  },
  components: {
    'rich-text-editor': RichTextEditor,
  },
  data() {
    return {
      orderNo: this.$route.query.orderNo,
      requestType: this.$route.query.requestType || '반품',
      detailedReason: '상세 사유는 선택사항입니다.',
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      refundStatus: '환불대기' // 기본값 설정
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
        refundStatus: this.refundStatus,
        orderNo: this.orderNo,
        userId: this.$store.state.member.id
      };

      try {
        const response = await axios.post('/api/refunds/create', refundData);
        console.log('환불 정보가 성공적으로 저장되었습니다:', response.data);
        this.$router.push({ name: 'RefundDetail', params: { orderNo: refundData.orderNo } });
      } catch (error) {
        console.error('환불 정보 저장 중 오류가 발생했습니다:', error);
      }
    },
    goOrderHistory() {
      this.$router.push({ name: 'OrderHistory' });
    }
  }
};
</script>

<style scoped>

</style>
