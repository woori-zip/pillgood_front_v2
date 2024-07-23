<template>
   <v-card>
   <v-card-title>
      <span class="headline">질문 추가</span>
   </v-card-title>
   <v-card-text>
      <v-form ref="form" v-model="valid">
         <v-text-field
         v-model="localQuestion.questionContent"
         label="질문 내용"
         :rules="contentRules"
         required
         ></v-text-field>

         <v-select
         v-model="localQuestion.deficiencyId"
         :items="deficiencies"
         item-title="deficiencyName"
         item-value="deficiencyId"
         label="결핍 선택"
         required
         ></v-select>
      </v-form>
   </v-card-text>
   <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" text @click="cancel">취소</v-btn>
      <v-btn color="blue darken-1" text @click="save" :disabled="!valid">저장</v-btn>
   </v-card-actions>
   </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
   name: 'AdminDetailedQuestionCreate',
   data() {
   return {
      valid: false,
      localQuestion: {
         questionContent: '',
         deficiencyId: null
      },
      contentRules: [
         v => !!v || '질문 내용을 입력하세요'
      ]
   };
   },
   computed: {
   ...mapGetters('deficiency', ['deficiencies']),
   deficienciesWithLogging() {
      console.log('Deficiencies:', this.deficiencies); // 디버깅 로그
      return this.deficiencies;
   }
   },
   methods: {
   ...mapActions('detailedquestion', ['createDetailedQuestion']),
   ...mapActions('deficiency', ['fetchDeficiencies']),
   async save() {
      if (this.$refs.form.validate()) {
         try {
         await this.createDetailedQuestion(this.localQuestion);
         this.$emit('save');
         } catch (error) {
         console.error('질문 추가 실패:', error);
         alert('질문 추가에 실패했습니다.');
         }
      }
   },
   cancel() {
      this.$emit('cancel');
   }
   },
   async created() {
   console.log('AdminQuestionCreate created.');
   await this.fetchDeficiencies();
   }
};
</script>

<style scoped>
</style>
