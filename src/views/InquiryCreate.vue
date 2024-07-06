<template>
  <div class="inquiry-create">
    <h4 class="text-melon">문의 작성</h4>
    <div class="main-container">
        <div class="box-container box-shadow">
            <form @submit.prevent="submitInquiry">
            <div>
                <label for="title">제목:</label>
                <input type="text" v-model="inquiry.inquiryTitle" id="title" required>
            </div>
            <div>
                <label for="type">유형:</label>
                <select v-model="inquiry.inquiryType" id="type" required>
                <option value="상품">상품</option>
                <option value="배송">배송</option>
                <option value="주문">주문</option>
                <option value="반품">반품</option>
                </select>
            </div>
            <div>
                <label for="content">내용:</label>
                <RichTextEditor v-model="inquiry.inquiryContent" />
            </div>
            <button type="submit">문의 등록</button>
            </form>
        </div>
    </div>
  </div>
</template>

<script>
import RichTextEditor from '@/components/RichTextEditor.vue';
import { mapActions, mapGetters } from 'vuex';

export default {
  components: { RichTextEditor },
  data() {
    return {
      inquiry: {
        inquiryTitle: '',
        inquiryType: '',
        inquiryContent: ''
      }
    };
  },
  methods: {
    ...mapActions('inquiry', ['createInquiry', 'fetchInquiries']),
    async submitInquiry() {
      try {
        console.log('문의 데이터:', this.inquiry); // 디버깅용 로그
        await this.createInquiry(this.inquiry);
        alert('문의가 작성되었습니다.');
        this.$router.push('/inquiries'); // 목록 페이지로 이동
      } catch (error) {
        console.error('문의 등록 실패:', error);
      }
    }
  },
  computed: {
    ...mapGetters('inquiry', ['allInquiries']),
    inquiryList() {
      console.log('inquiries 상태:', this.allInquiries); // inquiries 상태 로그
      return this.allInquiries;
    }
  }
};
</script>

<style src="../assets/styles.css"></style>
