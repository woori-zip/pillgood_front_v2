<template>
    <v-card>
      <v-card-title>
        <span class="text-h5">회원 정보 수정</span>
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="saveMember">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field v-model="localMember.name" label="이름" required></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="localMember.age" label="나이" type="number" required></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="localMember.gender"
                :items="[{ title: '여성', value: 'F' }, { title: '남성', value: 'M' }]"
                label="성별"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="localMember.subscriptionStatus"
                :items="[{ title: '구독중', value: true }, { title: '-', value: false }]"
                label="구독여부"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="localMember.email" label="이메일" type="email" required></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="localMember.phoneNumber" label="휴대폰번호" required></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="localMember.memberLevel"
                :items="[{ title: '관리자', value: 'ADMIN' }, { title: '사용자', value: 'USER' }]"
                label="권한"
                required
              ></v-select>
            </v-col>
          </v-row>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" type="submit">저장</v-btn>
            <v-btn color="grey" @click="$emit('cancel')">취소</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </template>
  
  <script>
  import { mapActions } from 'vuex';
  
  export default {
    name: 'AdminMemberEdit',
    props: {
      member: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        localMember: { ...this.member }
      };
    },
    methods: {
      ...mapActions('member', ['updateMember']),
      async saveMember() {
        try {
          await this.updateMember(this.localMember);
          this.$emit('save');
        } catch (error) {
          console.error('회원 정보를 업데이트하는 중 오류 발생:', error);
        }
      }
    }
  };
  </script>
  