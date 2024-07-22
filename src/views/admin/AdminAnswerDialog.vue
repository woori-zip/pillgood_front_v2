<template>
  <v-card>
    <v-card-title>
      <h2>{{ question.questionContent }} - 답변 관리</h2>
    </v-card-title>
    <v-card-text>
      <v-btn color="primary" @click="openAddAnswerDialog">답변 추가</v-btn>
      <v-data-table :headers="headers" :items="answers" class="elevation-1">
        <template v-slot:[`item.deficiencyName`]="{ item }">
          <div>{{ item.deficiencyName }}</div>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn color="info" small @click="openEditAnswerDialog(item)">수정</v-btn>
          <v-btn color="error" small @click="confirmDeleteAnswer(item.id)">삭제</v-btn>
        </template>
      </v-data-table>
    </v-card-text>
    <v-card-actions>
      <v-btn color="grey" @click="$emit('close')">닫기</v-btn>
    </v-card-actions>

    <v-dialog v-model="addAnswerDialogVisible" @close="closeAddAnswerDialog" max-width="800px">
      <AdminAnswerCreate :questionId="question.id" @save="onAnswerSave" @cancel="closeAddAnswerDialog" />
    </v-dialog>

    <v-dialog v-model="editAnswerDialogVisible" @close="closeEditAnswerDialog" max-width="800px">
      <AdminAnswerEdit :answer="selectedAnswer" @save="onAnswerSave" @cancel="closeEditAnswerDialog" />
    </v-dialog>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import AdminAnswerCreate from './AdminAnswerCreate.vue';
import AdminAnswerEdit from './AdminAnswerEdit.vue';

export default {
  name: 'AdminAnswerDialog',
  props: {
    question: {
      type: Object,
      required: true
    }
  },
  components: { AdminAnswerCreate, AdminAnswerEdit },
  data() {
    return {
      addAnswerDialogVisible: false,
      editAnswerDialogVisible: false,
      selectedAnswer: null,
      headers: [
        { text: '답변 내용', value: 'answerContent', align: 'center' },
        { text: '부족분', value: 'deficiencyName', align: 'center' }, // 추가
        { text: '수정/삭제', value: 'actions', align: 'center', sortable: false },
      ],
    };
  },
  computed: {
    ...mapGetters('adminSurvey', ['answersByQuestion']),
    answers() {
      return this.answersByQuestion(this.question.id);
    }
  },
  methods: {
    ...mapActions('adminSurvey', ['fetchAnswers', 'deleteAnswer']),
    openAddAnswerDialog() {
      this.addAnswerDialogVisible = true;
    },
    closeAddAnswerDialog() {
      this.addAnswerDialogVisible = false;
    },
    openEditAnswerDialog(answer) {
      this.selectedAnswer = answer;
      this.editAnswerDialogVisible = true;
    },
    closeEditAnswerDialog() {
      this.editAnswerDialogVisible = false;
      this.selectedAnswer = null;  // 모달을 닫을 때 상태 초기화
    },
    async confirmDeleteAnswer(answerId) {
      if (confirm('이 답변을 삭제하시겠습니까?')) {
        try {
          await this.deleteAnswer(answerId);
          alert('답변이 삭제되었습니다.');
        } catch (error) {
          console.error('답변 삭제 실패:', error);
          alert('답변 삭제에 실패했습니다.');
        }
      }
    },
    onAnswerSave() {
      this.closeAddAnswerDialog();
      this.closeEditAnswerDialog();
      this.fetchAnswers(this.question.id);
    }
  },
  created() {
    this.fetchAnswers(this.question.id);
  }
};
</script>

<style scoped>
.headline {
  font-weight: bold;
}
</style>
