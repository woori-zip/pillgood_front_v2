<template>
  <v-container class="main-container">
    <v-card>
      <v-card-title>
        <h1 class="text-melon">공지사항 목록</h1>
      </v-card-title>

      <v-card-subtitle>
        <v-row align="center">
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="searchQuery"
              @input="filterNotices"
              label="검색어 입력"
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="3">
            <v-btn color="primary" @click="resetFilters">초기화</v-btn>&nbsp;
            <v-btn color="primary" @click="openCreateDialog">새 공지사항 작성</v-btn>
          </v-col>
        </v-row>
      </v-card-subtitle>

      <v-data-table
        :headers="headers"
        :items="filteredNotices"
        class="elevation-1"
      >
        <template v-slot:[`item.noticeNo`]="{ item }">
          <span>{{ item.noticeNo }}</span>
        </template>
        <template v-slot:[`item.noticeTitle`]="{ item }">
          <div>
            <span class="clickable" @click="toggleNotice(item)">{{ item.noticeTitle }}</span>
            <v-expand-transition>
              <div v-if="item === expandedNotice">
                <div v-html="item.noticeContent"></div>
              </div>
            </v-expand-transition>
          </div>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn color="info" small @click="openEditDialog(item)">수정</v-btn>&nbsp;
          <v-btn color="error" small @click="confirmDelete(item.noticeNo)">삭제</v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="editDialog" max-width="800px">
      <AdminNoticeEdit :notice="selectedNotice" @save="onNoticeSave" @cancel="editDialog = false" />
    </v-dialog>

    <v-dialog v-model="createDialog" max-width="800px">
      <AdminNoticeCreate @save="onNoticeSave" @cancel="createDialog = false" />
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import AdminNoticeEdit from './AdminNoticeEdit.vue';
import AdminNoticeCreate from './AdminNoticeCreate.vue';

export default {
  name: 'AdminNoticeList',
  components: { AdminNoticeEdit, AdminNoticeCreate },
  data() {
    return {
      searchQuery: '',
      editDialog: false,
      createDialog: false,
      selectedNotice: null,
      expandedNotice: null,
      headers: [
        { title: '번호', value: 'noticeNo', align: 'center' },
        { title: '제목', value: 'noticeTitle', align: 'center' },
        { title: '수정/삭제', value: 'actions', align: 'center', sortable: false },
      ],
    };
  },
  computed: {
    ...mapGetters('notice', ['notices']),
    filteredNotices() {
      if (this.searchQuery) {
        const lowerQuery = this.searchQuery.toLowerCase();
        return this.notices.filter(notice =>
          notice.noticeTitle.toLowerCase().includes(lowerQuery) ||
          notice.noticeContent.toLowerCase().includes(lowerQuery)
        );
      }
      return this.notices;
    }
  },
  methods: {
    ...mapActions('notice', ['fetchNotices', 'deleteNotice']),
    async confirmDelete(noticeNo) {
      if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
        try {
          await this.deleteNotice(noticeNo);
          alert('공지사항이 삭제되었습니다.');
        } catch (error) {
          console.error('공지사항 삭제 실패:', error);
          alert('공지사항 삭제에 실패했습니다.');
        }
      }
    },
    filterNotices() {},
    openCreateDialog() {
      this.createDialog = true;
    },
    openEditDialog(notice) {
      this.selectedNotice = notice;
      this.editDialog = true;
    },
    toggleNotice(notice) {
      this.expandedNotice = this.expandedNotice === notice ? null : notice;
    },
    onNoticeSave() {
      this.createDialog = false;
      this.editDialog = false;
      this.fetchNotices();
    },
    resetFilters() {
      this.searchQuery = '';
    }
  },
  created() {
    this.fetchNotices();
  }
};
</script>

<style scoped>
.main-container {
  padding: 20px;
}

.text-melon {
  color: #ff6f61;
}

.clickable {
  cursor: pointer;
  color: blue;
  text-decoration: underline;
}
</style>
