<template>
  <div class="main-container">
    <div class="box-container">
      <h4 class="text-melon">문의 작성</h4>
      <form @submit.prevent="submitInquiry">
        <div class="form-group">
          <label for="type">문의 유형</label>
          <select v-model="inquiry.inquiryType" id="type" required>
            <option value="상품">상품</option>
            <option value="배송">배송</option>
            <option value="주문">주문</option>
            <option value="반품">반품</option>
          </select>
          <label for="title">제목</label>
          <input type="text" v-model="inquiry.inquiryTitle" id="title" required>
        </div>
        <div>
          <RichTextEditor v-model="inquiry.inquiryContent" @input="validateContent" />
          <div v-if="contentError" class="error-message">내용을 입력하세요.</div>
        </div>
        <div class="btn-container">
          <button type="submit" class="btn btn-green">문의 등록</button>
          <button type="button" @click="goHome" class="btn btn-gray">나가기</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import RichTextEditor from '@/components/RichTextEditor.vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import '../assets/styles.css';

export default {
  components: { RichTextEditor },
  data() {
    return {
      inquiry: {
        inquiryTitle: '',
        inquiryType: '',
        inquiryContent: '',
        inquiryDate: new Date().toISOString(),
        inquiryStatus: '미답변'
      },
      contentError: false
    };
  },
  computed: {
    ...mapState({
      memberUniqueId: state => state.member.memberId
    }),
    ...mapGetters('inquiry', ['allInquiries']),
    inquiryList() {
      console.log('inquiries 상태:', this.allInquiries);
      return this.allInquiries;
    }
  },
  methods: {
    ...mapActions('inquiry', ['createInquiry', 'fetchInquiries']),
    async submitInquiry() {
      // 제출하기 전에 유효성 검사
      if (!this.validateContent()) {
        this.contentError = true;
        return;
      }
      try {
        this.inquiry.memberUniqueId = this.memberUniqueId;
        console.log('문의 데이터:', this.inquiry);

        await this.createInquiry(this.inquiry);
        alert('문의가 작성되었습니다.');
        this.$router.push('/myinquiries');
      } catch (error) {
        console.error('문의 등록 실패:', error);
      }
    },
    validateContent() {
      // HTML 태그를 제거하고 텍스트만 추출
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.inquiry.inquiryContent;
      const textContent = tempDiv.textContent || tempDiv.innerText || "";

      // 텍스트가 비어 있거나 공백만 있는 경우 유효성 검사 실패
      if (!textContent.trim().length) {
        this.contentError = true;
        return false;
      }

      // 유효성 검사 통과
      this.contentError = false;
      return true;
    },
    goHome() {
      this.$router.push('/');
    },
  }
};
</script>

<style scoped>
@import '../assets/styles.css';
.form-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.form-group select {
  width: 200px;
}

.form-group input {
  width: 50%;
}
</style>
