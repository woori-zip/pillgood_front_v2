<template>
  <div class="main-container">
    <div class="inquiry-title">문의</div>
    <div class="inquiry-section">
      <p>결제, 정기구독, 포인트 사용 방법 등 필굿에 대해 궁금하신 내용을 문의 게시판을 통해 1:1로 질문하실 수 있습니다.</p>
        <div class="btn-container">
            <button class="btn btn-green" @click="goToInquiryCreate">문의하기</button>
        </div>    
    </div>
    
    <hr class="line">

    <div class="inquiry-section">
      <h6>제휴 문의</h6>
      <div class="contact-info">
        <ul>
          <li>marketing@pillgood.us</li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script>
import '../assets/styles.css';

export default {
  name: 'InquiryView',

methods: {
    goToInquiryCreate() {
      this.$router.push('/inquiries/create');
    }
}
};
</script>

<style scoped>
.btn-container {
    display: flex;
    justify-content: flex-start;
}

</style>
