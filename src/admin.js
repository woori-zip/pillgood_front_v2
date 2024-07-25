// src/admin.js (관리자 앱)
import { createApp } from 'vue';
import AdminApp from './AdminApp.vue';
import adminRouter from './router/admin'; // 관리자의 라우터 설정
import store from './store'; // Vuex 스토어를 불러옴
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css'; // CSS 경로
import { setupCalendar, Calendar, DatePicker } from 'v-calendar';
import 'v-calendar/dist/style.css'; // CSS
import axios from 'axios';
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:9095'; // 기본 URL 설정

import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
  components,
  directives,
});

console.log(QuillEditor); // QuillEditor가 제대로 불러와졌는지 확인

const adminApp = createApp(AdminApp);

setupCalendar(adminApp, {
  componentPrefix: 'vc' // v-calendar 대신 vc-calendar 사용
});

// QuillEditor 컴포넌트를 전역으로 등록
adminApp.component('QuillEditor', QuillEditor);

// V-calendar 전역으로 등록
adminApp.component('VCalendar', Calendar);
adminApp.component('VDatePicker', DatePicker);

// Vuex와 Router 등록 후 애플리케이션 마운트
adminApp.use(store);
adminApp.use(adminRouter);
adminApp.use(vuetify);
adminApp.mount('#admin-app');