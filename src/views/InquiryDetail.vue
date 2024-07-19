<template>
  <div class="main-container">
    <div v-if="inquiry" class="box-container box-shadow">
      <div>
        <div class="bttn-container">
          <button v-if="!isEditing" @click="editInquiry" class="btn btn-gray">수정</button>
          <button v-if="isEditing" @click="saveInquiry" class="btn btn-green">저장</button>
          <button v-if="isEditing" @click="cancelEdit" class="btn btn-gray">취소</button>
          <button v-if="canDeleteInquiry" @click="removeInquiry" class="btn btn-red">삭제</button>
        </div>
        <table class="line-table">
          <tr>
            <td><strong>제목</strong></td>
            <td colspan="2">
              <input v-if="isEditing" v-model="editableInquiry.inquiryTitle" required/>
              <span v-else>{{ inquiry.inquiryTitle }}</span>
            </td>
            <td><strong>유형</strong></td>
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
            <td colspan="5">
              <div class="content-cell">
                <RichTextEditor v-if="isEditing" v-model="editableInquiry.inquiryContent" @input="validateContent" />
                <span v-else v-html="inquiry.inquiryContent"></span>
                <div v-if="contentError" style="color: red;">내용을 입력하세요.</div>
                <div v-if="attachedImages.length" style="margin-top: 10px">
                  <div v-for="image in attachedImages" :key="image.url" style="display: inline-block; margin: 5px;">
                    <img :src="image.url" alt="Attached Image" style="width: 100px;">
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td><strong>상태</strong></td>
            <td>
              <input v-if="isEditing" v-model="editableInquiry.inquiryStatus" readonly />
              <span v-else>{{ inquiry.inquiryStatus }}</span>
            </td>
            <td><strong>날짜</strong></td>
            <td colspan="2">{{ formatDate(inquiry.inquiryDate) }}</td>
          </tr>
        </table>
        <div class="icon-container">
          <i class="icon fa-solid fa-turn-up"></i>
          <hr />
        </div>
      </div>
      <!-- 답변 -->
      <div style="margin-top: 10px">
        <div v-if="answer && answer.answerContent">
          <table class="line-table">
            <tr>
              <td><strong>내용</strong></td>
              <td>
                <RichTextEditor v-if="isEditingAnswer" v-model="editableAnswer.answerContent" @input="validateAnswerContent" />
                <span v-else v-html="answer.answerContent"></span>
                <div v-if="answerContentError" style="color: red;">내용을 입력하세요.</div>
              </td>
            </tr>
            <tr>
              <td><strong>날짜</strong></td>
              <td>{{ formatDate(answer.answerDate) }}</td>
            </tr>
          </table>
        </div>
        <div v-else>
          <p>답변이 아직 없습니다.</p>
        </div>
      </div>
      <div v-if="isAdmin" class="bttn-container" style="margin-top: 20px">
        <button v-if="!isEditingAnswer && answer && answer.answerContent" @click="editAnswer" class="btn btn-green">답변 수정</button>
        <button v-if="isEditingAnswer" @click="saveAnswer" class="btn btn-green">답변 저장</button>
        <button v-if="isEditingAnswer" @click="cancelAnswerEdit" class="btn btn-gray">답변 취소</button>
        <button v-if="!isEditingAnswer && (!answer || !answer.answerContent)" @click="initiateAnswerEdit" class="btn btn-green">답변 작성</button>
        <button v-if="answer && answer.answerContent" @click="deleteAnswerHandler" class="btn btn-red">답변 삭제</button>
      </div>
      <div v-if="isEditingAnswer && (!answer || !answer.answerContent)">
        <RichTextEditor v-model="editableAnswer.answerContent" @input="validateAnswerContent" />
        <div v-if="answerContentError" style="color: red;">내용을 입력하세요.</div>
        <button @click="createAnswerHandler" class="btn btn-green">답변 작성</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import RichTextEditor from '@/components/RichTextEditor.vue';
import '../assets/styles.css';

export default {
  components: { RichTextEditor },
  props: ['id'],
  data() {
    return {
      isEditing: false,
      isEditingAnswer: false,
      editableInquiry: null,
      editableAnswer: { inquiryNo: this.id, answerContent: '' },
      attachedImages: [],
      contentError: false,
      answerContentError: false
    };
  },
  computed: {
    ...mapGetters('inquiry', ['singleInquiry', 'singleAnswer']),
    ...mapState('member', ['isAdmin', 'memberId']),
    inquiry() {
      return this.singleInquiry;
    },
    answer() {
      return this.singleAnswer;
    },
    canDeleteInquiry() {
      return this.isAdmin || (this.inquiry && this.inquiry.memberUniqueId === this.memberId);
    }
  },
  methods: {
    ...mapActions('inquiry', [
      'fetchInquiry',
      'updateInquiry',
      'deleteInquiry',
      'fetchAnswer',
      'createAnswer',
      'updateAnswer',
      'deleteAnswer'
    ]),
    editInquiry() {
      this.isEditing = true;
      this.editableInquiry = { ...this.inquiry };
    },
    async saveInquiry() {
      if (!this.validateContent()) {
        this.contentError = true;
        return;
      }
      try {
        await this.updateInquiry(this.editableInquiry);
        this.isEditing = false;
        Object.assign(this.inquiry, this.editableInquiry);
        this.fetchInquiry(this.id); // 상태를 갱신하여 최신 데이터 반영
        alert('문의가 수정되었습니다.');
      } catch (error) {
        console.error('문의 수정 실패:', error);
      }
    },
    validateContent() {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.editableInquiry.inquiryContent;
      const textContent = tempDiv.textContent || tempDiv.innerText || "";

      if (!textContent.trim().length) {
        this.contentError = true;
        return false;
      }

      this.contentError = false;
      return true;
    },
    validateAnswerContent() {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.editableAnswer.answerContent;
      const textContent = tempDiv.textContent || tempDiv.innerText || "";

      if (!textContent.trim().length) {
        this.answerContentError = true;
        return false;
      }

      this.answerContentError = false;
      return true;
    },
    cancelEdit() {
      this.isEditing = false;
      this.editableInquiry = { ...this.inquiry };
    },
    async removeInquiry() {
      try {
        await this.deleteInquiry(this.id);
        alert('문의가 삭제되었습니다.');
        this.$router.goBack();
      } catch (error) {
        console.error('문의 삭제 실패:', error);
      }
    },
    editAnswer() {
      this.isEditingAnswer = true;
      this.editableAnswer = { ...this.answer, inquiryNo: this.id };
    },
    async saveAnswer() {
      if (!this.validateAnswerContent()) {
        this.answerContentError = true;
        return;
      }
      try {
        await this.updateAnswer(this.editableAnswer);
        this.isEditingAnswer = false;
        Object.assign(this.answer, this.editableAnswer);
        this.fetchAnswer(this.id); // 상태를 갱신하여 최신 데이터 반영
        alert('답변이 수정되었습니다.');
      } catch (error) {
        console.error('답변 수정 실패:', error);
      }
    },
    cancelAnswerEdit() {
      this.isEditingAnswer = false;
      this.editableAnswer = { ...this.answer, inquiryNo: this.id };
    },
    async createAnswerHandler() {
      if (!this.validateAnswerContent()) {
        this.answerContentError = true;
        return;
      }
      try {
        const newAnswer = {
          answerContent: this.editableAnswer ? this.editableAnswer.answerContent : '',
          answerDate: new Date().toISOString(),
          inquiry: {
            inquiryNo: this.inquiry.inquiryNo,
            memberUniqueId: this.inquiry.memberUniqueId,
            inquiryDate: this.inquiry.inquiryDate,
            inquiryStatus: this.inquiry.inquiryStatus,
            inquiryType: this.inquiry.inquiryType,
            inquiryTitle: this.inquiry.inquiryTitle,
            inquiryContent: this.inquiry.inquiryContent
          }
        };
        console.log("답변 생성:", newAnswer);
        const response = await this.createAnswer(newAnswer);
        console.log("서버 응답: ", response);
        alert('답변이 작성되었습니다.');
        this.isEditingAnswer = false;
        await this.fetchAnswer(this.inquiry.inquiryNo);
      } catch (error) {
        console.error('답변 작성 실패:', error);
      }
    },
    async deleteAnswerHandler() {
      try {
        await this.deleteAnswer(this.answer);
        alert('답변이 삭제되었습니다.');
        await this.fetchAnswer(this.inquiry.inquiryNo);
        this.inquiry.inquiryStatus = '미답변'; // 상태를 미답변으로 변경
        await this.updateInquiry(this.inquiry); // 상태 업데이트 호출
      } catch (error) {
        console.error('답변 삭제 실패:', error);
      }
    },
    initiateAnswerEdit() {
      this.isEditingAnswer = true;
      this.editableAnswer = { answerContent: '', inquiryNo: this.id }; 
    },
    formatDate(date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    extractImagesFromContent(content) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const imgTags = doc.querySelectorAll('img');
      console.log("Extracted images:", imgTags);
      return Array.from(imgTags).map(img => ({ url: img.src }));
    }
  },
  created() {
    this.fetchInquiry(this.id).then(() => {
      console.log("Inquiry content:", this.inquiry.inquiryContent);
      this.editableInquiry = { ...this.inquiry };
      this.attachedImages = this.extractImagesFromContent(this.inquiry.inquiryContent);
      console.log("첨부된 이미지들:", this.attachedImages);
      this.fetchAnswer(this.id).then(() => {
        if (this.answer) {
          this.editableAnswer = { ...this.answer, inquiryNo: this.id };
        } else {
          this.initiateAnswerEdit();
        }
      });
    });
  }
};
</script>

<style>
.bttn-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.icon-container {
  position: relative;
}

.icon {
  transform: rotate(90deg);
  color: #B4D9A9;
  display: inline-flex;
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%) rotate(90deg); /* 아이콘을 수직으로 가운데 정렬하고 회전 */
}

.content-cell {
  min-height: 300px; /* 내용 부분의 최소 높이 설정 */
  display: flex;
  padding: 20px;
}
</style>
