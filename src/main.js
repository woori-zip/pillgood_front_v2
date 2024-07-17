import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store'; // Vuex 스토어를 불러옴
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css'; // CSS 경로
import { setupCalendar, Calendar, DatePicker } from 'v-calendar';
import 'v-calendar/dist/style.css'; // CSS
import axios from 'axios';
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:9095'; // 기본 URL 설정
import vuetify from './plugins/vuetify'
import 'vuetify/styles'
// import '@mdi/font/css/materialdesignicons.css'


// Kakao SDK 로드
const kakaoScript = document.createElement('script');
kakaoScript.src = 'https://developers.kakao.com/sdk/js/kakao.js';
kakaoScript.onload = () => {
  /* global Kakao */ // Kakao를 전역 변수로 선언
  Kakao.init('03f074279f45f35b6bed2cfbcc42ec4d'); // 카카오 개발자 콘솔에서 발급받은 JavaScript 키
  console.log('Kakao SDK initialized');
};
document.head.appendChild(kakaoScript);

console.log(QuillEditor); // QuillEditor가 제대로 불러와졌는지 확인

const app = createApp(App);

setupCalendar(app, {
    componentPrefix: 'vc' // v-calendar 대신 vc-calendar 사용
})

// QuillEditor 컴포넌트를 전역으로 등록
app.component('QuillEditor', QuillEditor);

// V-calendar 전역으로 등록
app.component('VCalendar', Calendar);
app.component('VDatePicker', DatePicker);

// Vuex와 Router 등록 후 애플리케이션 마운트
app.use(store);
app.use(router);
app.mount('#app');
app.use(vuetify)
