<template>
  <v-container class="main-container">
    <v-card>
      <v-card-title>
        <h1 class="text-melon">문의 목록</h1>
      </v-card-title>

      <v-card-subtitle>
        <v-row align="center">
          <v-col cols="12" sm="4">
            <v-select
              v-model="searchOption"
              :items="searchOptions"
              label="검색 옵션"
              dense
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4" v-if="searchOption === 'title'">
            <v-text-field
              v-model="inputSearchQuery"
              label="검색어 입력"
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4" v-if="searchOption === 'status'">
            <v-select
              v-model="inputSearchQuery"
              :items="statusOptions"
              label="상태 선택"
              dense
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4" v-if="searchOption === 'type'">
            <v-select
              v-model="inputSearchQuery"
              :items="typeOptions"
              label="유형 선택"
              dense
            ></v-select>
          </v-col>
          <v-col cols="12" sm="2">
            <v-btn color="primary" @click="searchInquiries">검색</v-btn>&nbsp;
            <v-btn color="primary" @click="resetFilters">초기화</v-btn>
          </v-col>
        </v-row>
      </v-card-subtitle>

      <v-data-table
        :headers="headers"
        :items="filteredInquiries"
        class="elevation-1"
      >
        <template v-slot:[`item.inquiryTitle`]="{ item }">
          <span class="clickable" @click="openDetailDialog(item)">
            {{ item.inquiryTitle }}
            <v-icon v-if="hasImage(item.inquiryContent)">mdi-image</v-icon>
          </span>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="detailDialog" max-width="800px">
      <v-card>
        <v-card-title>문의 상세</v-card-title>
        <v-card-text>
          <inquiry-detail v-if="selectedInquiry" :id="selectedInquiry.inquiryNo" @close="detailDialog = false" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="detailDialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import InquiryDetail from './AdminInquiryDetail.vue';

export default {
  name: 'AdminInquiryList',
  components: { InquiryDetail },
  data() {
    return {
      searchOption: 'title',
      inputSearchQuery: '',
      searchQuery: '',
      detailDialog: false,
      selectedInquiry: null,
      headers: [
        { title: 'No', value: 'inquiryNo', align: 'center' },
        { title: 'Type', value: 'inquiryType', align: 'center' },
        { title: 'Title', value: 'inquiryTitle', align: 'center' },
        { title: 'Status', value: 'inquiryStatus', align: 'center' },
        { title: 'Date', value: 'inquiryDate', align: 'center', sortable: true },
      ],
      searchOptions: [
        { title: '제목', value: 'title' },
        { title: '상태', value: 'status' },
        { title: '유형', value: 'type' },
      ],
      statusOptions: [
        { title: '답변 완료', value: '답변 완료' },
        { title: '미답변', value: '미답변' },
      ],
      typeOptions: [
        { title: '상품', value: '상품' },
        { title: '제품', value: '제품' },
        { title: '주문', value: '주문' },
        { title: '배송', value: '배송' },
      ],
    };
  },
  computed: {
    ...mapGetters('inquiry', ['allInquiries']),
    filteredInquiries() {
      let filtered = this.allInquiries;

      if (this.searchQuery) {
        filtered = filtered.filter(inquiry => {
          if (this.searchOption === 'title') {
            return inquiry.inquiryTitle.includes(this.searchQuery);
          } else if (this.searchOption === 'status') {
            return inquiry.inquiryStatus === this.searchQuery;
          } else if (this.searchOption === 'type') {
            return inquiry.inquiryType === this.searchQuery;
          }
        });
      }

      return filtered.sort((a, b) => new Date(b.inquiryDate) - new Date(a.inquiryDate));
    }
  },
  methods: {
    ...mapActions('inquiry', ['fetchInquiries']),
    searchInquiries() {
      this.searchQuery = this.inputSearchQuery;
    },
    resetFilters() {
      this.inputSearchQuery = '';
      this.searchQuery = '';
    },
    hasImage(content) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const imgTags = doc.querySelectorAll('img');
      return imgTags.length > 0;
    },
    openDetailDialog(inquiry) {
      this.selectedInquiry = inquiry;
      this.detailDialog = true;
    }
  },
  created() {
    this.fetchInquiries();
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
  text-decoration: underline;
}
</style>
