<template>
  <v-container class="main-container">
    <v-card>
      <v-card-title>
        <h1 class="text-melon">설문 질문 목록</h1>
      </v-card-title>

      <v-card-subtitle>
        <v-row align="center">
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="searchQuery"
              @input="filterQuestions"
              label="검색어 입력"
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="3">
            <v-btn color="primary" @click="resetFilters">초기화</v-btn>&nbsp;
            <v-btn color="primary" @click="openCreateDialog">질문 추가</v-btn>
          </v-col>
        </v-row>
      </v-card-subtitle>

      <v-data-table
        :headers="headers"
        :items="filteredQuestions"
        class="elevation-1"
      >
        <template v-slot:[`item.questionContent`]="{ item }">
          <div>
            <span class="clickable" @click="openAnswerDialog(item)">{{ item.questionContent }}</span>
          </div>
        </template>
        <template v-slot:[`item.id`]="{ item }">
          <div>{{ item.id }}</div>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn color="info" small @click="openEditDialog(item)">수정</v-btn>&nbsp;
          <v-btn color="error" small @click="confirmDelete(item)">삭제</v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="createDialogVisible" max-width="800px">
      <AdminQuestionCreate @save="onQuestionSave" @cancel="closeCreateDialog" />
    </v-dialog>

    <v-dialog v-model="editDialogVisible" max-width="800px">
      <AdminQuestionEdit :question="selectedQuestion" @save="onQuestionSave" @cancel="closeEditDialog" />
    </v-dialog>

    <v-dialog v-model="answerDialogVisible" max-width="800px">
      <AdminAnswerDialog :question="selectedQuestion" @close="closeAnswerDialog" />
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import AdminQuestionEdit from './AdminQuestionEdit.vue';
import AdminQuestionCreate from './AdminQuestionCreate.vue';
import AdminAnswerDialog from './AdminAnswerDialog.vue';

export default {
  name: 'AdminSurveyManagement',
  components: { AdminQuestionEdit, AdminQuestionCreate, AdminAnswerDialog },
  data() {
    return {
      searchQuery: '',
      createDialogVisible: false,
      editDialogVisible: false,
      answerDialogVisible: false,
      selectedQuestion: null,
      headers: [
        { title: 'ID', value: 'id', align: 'center' },
        { title: '내용', value: 'questionContent', align: 'center' },
        { title: '수정/삭제', value: 'actions', align: 'center', sortable: false },
      ],
    };
  },
  computed: {
    ...mapGetters('adminSurvey', ['allQuestions']),
    filteredQuestions() {
      if (this.searchQuery) {
        const lowerQuery = this.searchQuery.toLowerCase();
        return this.allQuestions.filter(question =>
          question.questionContent.toLowerCase().includes(lowerQuery)
        );
      }
      return this.allQuestions;
    },
  },
  methods: {
    ...mapActions('adminSurvey', ['fetchQuestions', 'deleteQuestion']),
    async confirmDelete(question) {
      if (confirm('이 질문을 삭제하시겠습니까? 답변이 남아있는 경우 삭제할 수 없습니다.')) {
        try {
          await this.deleteQuestion(question.id);
          alert('질문이 삭제되었습니다.');
          await this.fetchQuestions();
        } catch (error) {
          console.error('질문 삭제 실패:', error);
          alert('답변이 남아있어 질문을 삭제할 수 없습니다.');
        }
      }
    },
    filterQuestions() {},
    openCreateDialog() {
      this.createDialogVisible = true;
    },
    closeCreateDialog() {
      this.createDialogVisible = false;
    },
    openEditDialog(question) {
      this.selectedQuestion = question;
      this.editDialogVisible = true;
    },
    closeEditDialog() {
      this.editDialogVisible = false;
      this.selectedQuestion = null;
    },
    openAnswerDialog(question) {
      this.selectedQuestion = question;
      this.answerDialogVisible = true;
    },
    closeAnswerDialog() {
      this.answerDialogVisible = false;
      this.selectedQuestion = null;
    },
    async onQuestionSave() {
      await this.fetchQuestions();
      this.selectedQuestion = null;  // 선택된 질문을 초기화합니다.
      this.closeCreateDialog();
      this.closeEditDialog();
    },
    resetFilters() {
      this.searchQuery = '';
    }
  },
  created() {
    this.fetchQuestions();
  }
};
</script>

<style scoped>
.main-container {
  padding: 20px;
}

.text-melon {
  color: #94b58b;
}

.clickable {
  cursor: pointer;
}
</style>
