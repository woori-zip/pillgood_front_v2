<template>
  <v-card>
    <v-card-title>
      <h1 class="text-melon">게시글 등록</h1>
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="submitNotice">
        <v-text-field v-model="noticeTitle" label="제목" required></v-text-field>
        <RichTextEditor v-model="noticeContent" />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" type="submit">Create Notice</v-btn>
          <v-btn color="grey" @click="$emit('cancel')">취소</v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions } from 'vuex';
import RichTextEditor from '@/components/RichTextEditor.vue';

export default {
  name: 'AdminNoticeCreate',
  components: {
    RichTextEditor
  },
  data() {
    return {
      noticeTitle: '',
      noticeContent: ''
    };
  },
  methods: {
    ...mapActions('notice', ['createNotice']),
    async submitNotice() {
      try {
        await this.createNotice({ noticeTitle: this.noticeTitle, noticeContent: this.noticeContent });
        this.$emit('save');
      } catch (error) {
        console.error('공지사항 등록 실패:', error);
      }
    }
  }
};
</script>

<style scoped>
.text-melon {
  color: #ff6f61;
}
</style>
