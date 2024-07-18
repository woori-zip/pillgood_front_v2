<template>
  <v-container class="main-container">
    <v-card>
      <v-card-title>
        <h1>문의 상세보기</h1>
      </v-card-title>
      <v-card-text>
        <v-form v-if="inquiry">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field v-if="isEditing" v-model="editableInquiry.inquiryTitle" label="제목" required></v-text-field>
              <span v-else>{{ inquiry.inquiryTitle }}</span>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-if="isEditing"
                v-model="editableInquiry.inquiryType"
                :items="typeOptions"
                label="유형"
                required
              ></v-select>
              <span v-else>{{ inquiry.inquiryType }}</span>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <RichTextEditor v-if="isEditing" v-model="editableInquiry.inquiryContent" @input="validateContent" />
              <span v-else v-html="inquiry.inquiryContent"></span>
              <div v-if="contentError" style="color: red;">내용을 입력하세요.</div>
            </v-col>
            <v-col cols="12" v-if="attachedImages.length" style="margin-top: 10px">
              <div v-for="image in attachedImages" :key="image.url" style="display: inline-block; margin: 5px;">
                <img :src="image.url" alt="Attached Image" style="width: 100px;">
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field v-if="isEditing" v-model="editableInquiry.inquiryStatus" label="상태" readonly></v-text-field>
              <span v-else>{{ inquiry.inquiryStatus }}</span>
            </v-col>
            <v-col cols="12" sm="6">
              <span>{{ formatDate(inquiry.inquiryDate) }}</span>
            </v-col>
          </v-row>
        </v-form>
        <div v-else>
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <br>
        <v-card-subtitle>
            <v-btn v-if="!isEditing" color="secondary" @click="editInquiry">수정</v-btn>&nbsp;
            <v-btn v-if="isEditing" color="primary" @click="saveInquiry">저장</v-btn>&nbsp;
            <v-btn v-if="isEditing" color="grey" @click="cancelEdit">취소</v-btn>&nbsp;
            <v-btn v-if="canDeleteInquiry" color="error" @click="removeInquiry">삭제</v-btn>
        </v-card-subtitle>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>답변</v-card-title>
      <v-card-text>
        <v-form v-if="isEditingAnswer">
          <RichTextEditor v-model="editableAnswer.answerContent" @input="validateAnswerContent" />
          <div v-if="answerContentError" style="color: red;">내용을 입력하세요.</div>
        </v-form>
        <div v-else>
          <div v-if="answer">{{ answer.answerContent }}</div>
          <div v-else>답변이 아직 없습니다.</div>
          <div>{{ formatDate(answer ? answer.answerDate : null) }}</div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="!isEditingAnswer && answer && answer.answerContent" color="secondary" @click="editAnswer">답변 수정</v-btn>
        <v-btn v-if="isEditingAnswer" color="primary" @click="saveAnswer">답변 저장</v-btn>
        <v-btn v-if="isEditingAnswer" color="grey" @click="cancelAnswerEdit">답변 취소</v-btn>
        <v-btn v-if="!isEditingAnswer && (!answer || !answer.answerContent)" color="primary" @click="initiateAnswerEdit">답변 작성</v-btn>
        <v-btn v-if="answer && answer.answerContent" color="error" @click="deleteAnswerHandler">답변 삭제</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import RichTextEditor from '@/components/RichTextEditor.vue';

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
      answerContentError: false,
      typeOptions: [
        { title: '상품', value: '상품' },
        { title: '배송', value: '배송' },
        { title: '주문', value: '주문' },
        { title: '반품', value: '반품' },
      ],
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
    goBack() {
      this.$router.push('/inquiries');
    },
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
        this.$router.go(); // 페이지 새로고침
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
            if (this.answer && this.answer.answerContent) {
            await this.updateAnswer(this.editableAnswer);
            alert('답변이 수정되었습니다.');
            } else {
            await this.createAnswerHandler();
            }
            this.isEditingAnswer = false;
            Object.assign(this.answer, this.editableAnswer);
            this.$router.go(); // 페이지 새로고침
        } catch (error) {
            console.error('답변 저장 실패:', error);
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
            inquiryNo: this.inquiry.inquiryNo,
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
            this.$router.go(); // 페이지 새로고침
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
        this.$router.go(); // 페이지 새로고침
      } catch (error) {
        console.error('답변 삭제 실패:', error);
      }
    },
    initiateAnswerEdit() {
      this.isEditingAnswer = true;
      this.editableAnswer = { answerContent: '', inquiryNo: this.id }; 
    },
    formatDate(date) {
      if (!date) return '';
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    extractImagesFromContent(content) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const imgTags = doc.querySelectorAll('img');
      return Array.from(imgTags).map(img => ({ url: img.src }));
    }
  },
  created() {
    this.fetchInquiry(this.id).then(() => {
      this.editableInquiry = { ...this.inquiry };
      this.attachedImages = this.extractImagesFromContent(this.inquiry.inquiryContent);
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

<style scoped>
.main-container {
  padding: 20px;
}

.bttn-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.icon {
  transform: rotate(90deg);
  color: #B4D9A9;
  display: inline-flex;
}
</style>
