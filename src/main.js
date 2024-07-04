import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store'; // Vuex 스토어를 불러옴
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css'; // CSS 경로

console.log(QuillEditor); // QuillEditor가 제대로 불러와졌는지 확인

const app = createApp(App);

// QuillEditor 컴포넌트를 전역으로 등록
app.component('QuillEditor', QuillEditor);

// Vuex와 Router 등록 후 애플리케이션 마운트
app.use(store);
app.use(router);
app.mount('#app');
