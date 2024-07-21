<template>
  <v-card>
    <v-card-title>
      <h2>질문 수정</h2>
    </v-card-title>
    <v-card-text>
      <v-form ref="form">
        <v-textarea v-model="questionContent" label="질문 내용" required></v-textarea>
        <v-select 
          v-model="parentQuestionId" 
          :items="parentQuestions" 
          item-text="title" 
          item-value="value" 
          label="부모 질문" 
          clearable>
        </v-select>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="saveQuestion">저장</v-btn>
      <v-btn color="grey" @click="$emit('cancel')">취소</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'AdminQuestionEdit',
  props: {
    question: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      questionContent: this.question.questionContent || '',
      parentQuestionId: this.question.parentQuestionId || null,
    };
  },
  computed: {
    ...mapGetters('adminSurvey', ['allQuestions']),
    parentQuestions() {
      if (!this.allQuestions) {
        return [];
      }
      return [{ title: '부모 질문 없음', value: null }].concat(
        this.allQuestions
          .filter(q => q.id !== (this.question && this.question.id))
          .map(question => ({
            title: question.questionContent,
            value: question.id
          }))
      );
    }
  },
  methods: {
    ...mapActions('adminSurvey', ['updateQuestion', 'fetchQuestions']),
    async saveQuestion() {
      if (this.$refs.form.validate()) {
        try {
          await this.updateQuestion({ id: this.question.id, questionContent: this.questionContent, parentQuestionId: this.parentQuestionId });
          this.$emit('save');
          alert('질문이 수정되었습니다.');
        } catch (error) {
          console.error('질문 수정 실패:', error);
          alert('질문 수정에 실패했습니다.');
        }
      }
    },
  },
  created() {
    this.fetchQuestions();
  }
};
</script>

<style scoped>
.headline {
  font-weight: bold;
}
</style>
