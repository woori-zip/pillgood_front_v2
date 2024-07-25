<template>
  <v-container class="main-container">
    <v-card>
      <v-card-title>
        <h1 class="text-melon">상세 질문 목록</h1>
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
        <template v-slot:[`item.deficiencyId`]="{ item }">
          <div>{{ getDeficiencyName(item.deficiencyId) }}</div>
        </template>
        <template v-slot:[`item.questionContent`]="{ item }">
          <div>
            <span class="clickable" @click="openAnswerDialog(item)">{{ item.questionContent }}</span>
          </div>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn color="info" small @click="openEditDialog(item)">수정</v-btn>&nbsp;
          <v-btn color="error" small @click="confirmDelete(item)">삭제</v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="createDialogVisible" max-width="800px">
      <AdminDetailedQuestionCreate @save="onQuestionSave" @cancel="closeCreateDialog" />
    </v-dialog>

    <v-dialog v-model="editDialogVisible" max-width="800px">
      <AdminDetailedQuestionEdit :question="selectedQuestion" @save="onQuestionSave" @cancel="closeEditDialog" />
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import AdminDetailedQuestionEdit from './AdminDetailedQuestionEdit.vue';
import AdminDetailedQuestionCreate from './AdminDetailedQuestionCreate.vue';

export default {
  name: 'AdminDetailedQuestionManagement',
  components: { AdminDetailedQuestionEdit, AdminDetailedQuestionCreate },
  data() {
    return {
      searchQuery: '',
      createDialogVisible: false,
      editDialogVisible: false,
      answerDialogVisible: false,
      selectedQuestion: null,
      headers: [
        { text: 'ID', value: 'detailedQuestionId', align: 'center' },
        { text: '내용', value: 'questionContent', align: 'center' },
        { text: '결핍', value: 'deficiencyId', align: 'center' },
        { text: '수정/삭제', value: 'actions', align: 'center', sortable: false },
      ],
    };
  },
  computed: {
    ...mapGetters('detailedquestion', ['allQuestions']),
    ...mapGetters('deficiency', ['deficiencies']),
    filteredQuestions() {
      console.log('Filtering questions with query:', this.searchQuery); // 디버그 로그
      if (this.searchQuery) {
        const lowerQuery = this.searchQuery.toLowerCase();
        const filtered = this.allQuestions.filter(question =>
          question.questionContent.toLowerCase().includes(lowerQuery) ||
          this.getDeficiencyName(question.deficiencyId).toLowerCase().includes(lowerQuery)
        );
        console.log('Filtered questions:', filtered); // 디버그 로그
        return filtered;
      }
      return this.allQuestions;
    },
  },
  methods: {
    ...mapActions('detailedquestion', ['fetchDetailedQuestions', 'deleteDetailedQuestion']),
    ...mapActions('deficiency', ['fetchDeficiencies']),
    async confirmDelete(question) {
      if (confirm('이 질문을 삭제하시겠습니까? 답변이 남아있는 경우 삭제할 수 없습니다.')) {
        try {
          console.log('Deleting question:', question); // 디버그 로그
          await this.deleteDetailedQuestion(question.detailedQuestionId);
          alert('질문이 삭제되었습니다.');
          await this.fetchDetailedQuestions();
        } catch (error) {
          console.error('질문 삭제 실패:', error);
          alert('답변이 남아있어 질문을 삭제할 수 없습니다.');
        }
      }
    },
    filterQuestions() {
      console.log('Filtering questions...'); // 디버그 로그
    },
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
    async onQuestionSave() {
      await this.fetchDetailedQuestions();
      this.selectedQuestion = null;  // 선택된 질문을 초기화합니다.
      this.closeCreateDialog();
      this.closeEditDialog();
    },
    resetFilters() {
      this.searchQuery = '';
    },
    getDeficiencyName(deficiencyId) {
      const deficiency = this.deficiencies.find(d => d.deficiencyId === deficiencyId);
      return deficiency ? deficiency.deficiencyName : 'Unknown';
    }
  },
  async created() {
    console.log('Component created. Fetching questions...'); // 디버그 로그
    await this.fetchDeficiencies();
    await this.fetchDetailedQuestions();
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
