<template>
  <v-card>
    <v-card-title>
      <h1 class="text-melon">{{ notice.noticeTitle }}</h1>
    </v-card-title>
    <v-card-text>
      <div v-html="notice.noticeContent"></div>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="grey" @click="$emit('close')">닫기</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'AdminNoticeDetail',
  props: {
    notice: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.text-melon {
  color: #ff6f61;
}
</style>
