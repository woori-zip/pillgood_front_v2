<template>
  <v-card>
    <v-card-title>
      <h1 class="text-melon">게시글 수정</h1>
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="submitNoticeUpdate">
        <v-text-field v-model="noticeTitle" label="제목" required></v-text-field>
        <RichTextEditor v-model="noticeContent" />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" type="submit">Update Notice</v-btn>
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
  name: 'AdminNoticeEdit',
  components: {
    RichTextEditor
  },
  props: {
    notice: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      noticeTitle: this.notice.noticeTitle,
      noticeContent: this.notice.noticeContent
    };
  },
  methods: {
    ...mapActions('notice', ['updateNotice']),
    async submitNoticeUpdate() {
      try {
        await this.updateNotice({ id: this.notice.noticeNo, noticeTitle: this.noticeTitle, noticeContent: this.noticeContent });
        this.$emit('save');
      } catch (error) {
        console.error('Failed to update notice:', error);
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
