<template>
  <div class="inquiry-create">
    <div class="main-container">
        <div class="box-container box-shadow">
          <h4 class="text-melon">문의 작성</h4>
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
            <br>
            <button type="submit" class="btn-green">문의 등록</button>&nbsp;
            <button @click="goBack" class="btn-green">목록으로</button>
            </form>
        </div>
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
        inquiryDate: new Date().toISOString(),  // 현재 날짜와 시간 설정
        inquiryStatus: '미답변'  // 기본 상태 설정
      }
    };
  },
  computed: {
    ...mapState({
      memberUniqueId: state => state.member.memberId  // Vuex state에서 memberId를 가져와 memberUniqueId로 설정
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
      try {
        // HTML 태그 제거
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.inquiry.inquiryContent;
        this.inquiry.inquiryContent = tempDiv.textContent || tempDiv.innerText || "";

        this.inquiry.memberUniqueId = this.memberUniqueId;  // memberUniqueId를 inquiry 객체에 추가
        console.log('문의 데이터:', this.inquiry);
        await this.createInquiry(this.inquiry);
        alert('문의가 작성되었습니다.');
        this.$router.push('/inquiries');  // 목록 페이지로 이동
      } catch (error) {
        console.error('문의 등록 실패:', error);
      }
    },
    goBack() {
      this.$router.push('/inquiries');
    },
  }
};
</script>

<style src="../assets/styles.css"></style>
