import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/HomeView.vue';
import Register from '../views/RegisterMember.vue';
import Login from '../views/LoginView.vue';
import ForgotPassword from '../views/ForgotPasswordView.vue';
import ChangePassword from '../views/ChangePasswordView.vue';
import MyPage from '../views/MyPage.vue';

// product
import ProductCreate from '../views/product/ProductCreate.vue';
import AdminProductList from '../views/product/ProductList.vue';
import ProductList from '../views/ProductList.vue'
import ProductDetail from '../views/ProductDetail.vue'

// notice
import NoticeList from '../views/NoticeList.vue';
import NoticeCreate from '../views/NoticeCreate.vue';
import NoticeEdit from '../views/NoticeEdit.vue';

import Survey from '../views/SurveyPage.vue';


// cart
import Cart from '../views/CartPage.vue'

// order
import Order from '../views/OrderPage.vue';

import Template from '../views/Template.vue';
import store from '../store'; // store 가져오기

const routes = [
  { path: '/', component: Home },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  { path: '/forgotpassword', component: ForgotPassword },
  { path: '/changepassword', component: ChangePassword },
  { path: '/mypage', component: MyPage, meta: { requiresAuth: true } }, // 인증 필요

  // product
  { path: '/productcreate', component: ProductCreate, meta: { requiresAuth: true } }, // 인증 필요
  { path: '/admin/productlist', component: AdminProductList },
  { path: '/productlist', component: ProductList },
  { path: '/product/:id' , name: 'ProductDetail', component: ProductDetail, props: true },

  // notice
  { path: '/noticelist', name: 'NoticeList', component: NoticeList },
  { path: '/noticecreate', name: 'NoticeCreate', component: NoticeCreate, meta: { requiresAuth: true } }, // 인증 필요
  { path: '/noticeedit/:id', name: 'NoticeEdit', component: NoticeEdit, props: true, meta: { requiresAuth: true } }, // 인증 필요
  { path: '/survey', name: 'Survey', component: Survey, meta: { requiresAuth: true } }, // 인증 필요

  // cart
  {path: '/cart' , component: Cart},

  // order
  { path: '/order', component: Order, name: 'Order' },

  { path: '/template', component: Template }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// 라우터 가드 설정
router.beforeEach((to, from, next) => {
  console.log('store:', store); // 스토어 로그 출력
  const loggedIn = store.state?.member?.isLoggedIn;

  if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router;
