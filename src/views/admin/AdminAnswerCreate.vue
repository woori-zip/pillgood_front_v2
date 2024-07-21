<template>
  <v-card>
    <v-card-title>
      <h2>답변 추가</h2>
    </v-card-title>
    <v-card-text>
      <v-form ref="form">
        <v-textarea v-model="answerContent" label="답변 내용" required></v-textarea>
        <v-select 
          v-model="deficiencyId" 
          :items="deficiencyOptions" 
          item-text="title" 
          item-value="value" 
          label="부족분"
          clearable>
        </v-select>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="saveAnswer">저장</v-btn>
      <v-btn color="grey" @click="$emit('cancel')">취소</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'AdminAnswerCreate',
  props: {
    questionId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      answerContent: '',
      deficiencyId: null,
    };
  },
  computed: {
    ...mapGetters('adminSurvey', ['deficiencies']),
    deficiencyOptions() {
      return this.deficiencies.map(deficiency => ({
        title: deficiency.deficiencyName,
        value: deficiency.deficiencyId
      }));
    }
  },
  methods: {
    ...mapActions('adminSurvey', ['createAnswer', 'fetchDeficiencies']),
    async saveAnswer() {
      if (this.$refs.form.validate()) {
        try {
          await this.createAnswer({ questionId: this.questionId, answerContent: this.answerContent, deficiencyId: this.deficiencyId });
          this.$emit('save');
          alert('답변이 추가되었습니다.');
        } catch (error) {
          console.error('답변 추가 실패:', error);
          alert('답변 추가에 실패했습니다.');
        }
      }
    },
  },
  created() {
    this.fetchDeficiencies();
  }
};
</script>

<style scoped>
.headline {
  font-weight: bold;
}
</style>
