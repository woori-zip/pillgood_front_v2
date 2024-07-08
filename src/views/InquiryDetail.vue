<template>
  <div class="main-container">
    <div v-if="inquiry" class="box-container box-shadow">
      <table>
        <tr>
          <td><strong>제목:</strong></td>
          <td>
            <input v-if="isEditing" v-model="editableInquiry.inquiryTitle" />
            <span v-else>{{ inquiry.inquiryTitle }}</span>
          </td>
        </tr>
        <tr>
          <td><strong>유형:</strong></td>
          <td>
            <select v-if="isEditing" v-model="editableInquiry.inquiryType">
              <option value="상품">상품</option>
              <option value="배송">배송</option>
              <option value="주문">주문</option>
              <option value="반품">반품</option>
            </select>
            <span v-else>{{ inquiry.inquiryType }}</span>
          </td>
        </tr>
        <tr>
          <td><strong>내용:</strong></td>
          <td>
            <textarea v-if="isEditing" v-model="editableInquiry.inquiryContent"></textarea>
            <span v-else>{{ inquiry.inquiryContent }}</span>
          </td>
        </tr>
        <tr>
          <td><strong>상태:</strong></td>
          <td>
            <input v-if="isEditing" v-model="editableInquiry.inquiryStatus" />
            <span v-else>{{ inquiry.inquiryStatus }}</span>
          </td>
        </tr>
        <tr>
          <td><strong>날짜:</strong></td>
          <td>{{ formatDate(inquiry.inquiryDate) }}</td>
        </tr>
      </table>
      <div class="btn-container">
        <button @click="goBack" class="btn-green">목록으로</button>
        <button v-if="!isEditing" @click="editInquiry" class="btn-blue">수정</button>
        <button v-if="isEditing" @click="saveInquiry" class="btn-blue">저장</button>
        <button v-if="isEditing" @click="cancelEdit" class="btn-gray">취소</button>
        <button @click="removeInquiry" class="btn-red">삭제</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import '../assets/styles.css';

export default {
  props: ['id'],
  data() {
    return {
      isEditing: false,
      editableInquiry: null
    };
  },
  computed: {
    ...mapGetters('inquiry', ['singleInquiry']),
    inquiry() {
      return this.singleInquiry;
    }
  },
  methods: {
    ...mapActions('inquiry', ['fetchInquiry', 'updateInquiry', 'deleteInquiry']),
    goBack() {
      this.$router.push('/inquiries');
    },
    editInquiry() {
      this.isEditing = true;
      this.editableInquiry = { ...this.inquiry };
    },
    async saveInquiry() {
      try {
        await this.updateInquiry(this.editableInquiry);
        this.isEditing = false;
        this.$store.commit('inquiry/setInquiry', this.editableInquiry);  // 바로 업데이트 반영
        alert('문의가 수정되었습니다.');
      } catch (error) {
        console.error('문의 수정 실패:', error);
      }
    },
    cancelEdit() {
      this.isEditing = false;
      this.editableInquiry = { ...this.inquiry };
    },
    async removeInquiry() {
      try {
        await this.deleteInquiry(this.id);
        alert('문의가 삭제되었습니다.');
        this.goBack();
      } catch (error) {
        console.error('문의 삭제 실패:', error);
      }
    },
    formatDate(date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(date).toLocaleDateString(undefined, options);
    }
  },
  created() {
    this.fetchInquiry(this.id).then(() => {
      this.editableInquiry = { ...this.inquiry };
    });
  }
};
</script>
