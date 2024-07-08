import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/HomeView.vue';
import Register from '../views/RegisterMember.vue';
import Login from '../views/LoginView.vue';
import ForgotPassword from '../views/ForgotPasswordView.vue';
import ChangePassword from '../views/ChangePasswordView.vue';

// member
import MemberList from '../views/MemberList.vue';
import MemberEdit from '../views/MemberEdit.vue';
import MyPage from '../views/MyPage.vue';

// product
import ProductCreate from '../views/product/ProductCreate.vue';
import AdminProductList from '../views/product/ProductList.vue';
import ProductList from '../views/ProductList.vue'
import ProductEdit from '../views/product/ProductEdit.vue'
import ProductDetail from '../views/ProductDetail.vue'
import NutrientEdit from '../views/product/NutrientEdit.vue'

// notice
import NoticeList from '../views/NoticeList.vue';
import NoticeCreate from '../views/NoticeCreate.vue';
import NoticeEdit from '../views/NoticeEdit.vue';
import NoticeDetail from '../views/NoticeDetail.vue'; // 공지사항 상세 페이지 추가

// survey
import Survey from '../views/SurveyPage.vue';
import SurveyResult from '../views/SurveyResultView.vue';

// cart
import Cart from '../views/CartPage.vue'

// order
import Order from '../views/OrderPage.vue';
import OrderHistory from '../views/OrderHistory.vue';

// review
import ReviewCreate from '../views/ReviewCreate.vue'
import ReviewList from '../views/ReviewList.vue'

import Template from '../views/Template.vue';
import store from '../store'; // store 가져오기

// inquiry
import Inquirylist from '../views/InquiryPage.vue'
import InquiryCreate from '../views/InquiryCreate.vue'
import InquiryDetail from '../views/InquiryDetail.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  { path: '/forgotpassword', component: ForgotPassword },
  { path: '/changepassword', component: ChangePassword },
  { path: '/mypage', component: MyPage, meta: { requiresAuth: true } }, // 인증 필요
  { path: '/memberlist', component: MemberList },
  { path: '/memberedit', component: MemberEdit },

  // product
  { path: '/productcreate', component: ProductCreate, meta: { requiresAuth: true } }, // 인증 필요
  { path: '/admin/productlist', component: AdminProductList },
  { path: '/productedit/:id', name: 'ProductEdit', component: ProductEdit, props: true },
  { path: '/productlist', component: ProductList },
  { path: '/product/:id' , name: 'ProductDetail', component: ProductDetail, props: true },
  { path: '/nutrientedit', component: NutrientEdit },

  // notice
  { path: '/noticelist', name: 'NoticeList', component: NoticeList },
  { path: '/noticecreate', name: 'NoticeCreate', component: NoticeCreate, meta: { requiresAuth: true } }, // 인증 필요
  { path: '/noticeedit/:id', name: 'NoticeEdit', component: NoticeEdit, props: true, meta: { requiresAuth: true } }, // 인증 필
  { path: '/noticedetail/:id', name: 'NoticeDetail', component: NoticeDetail, props: true }, // 공지사항 상세 페이지 추가

  // survey
  { path: '/surveyresult', name: SurveyResult, component: SurveyResult },
  { path: '/survey', name: 'Survey', component: Survey, meta: { requiresAuth: true } }, // 인증 필요

  // cart
  {path: '/cart' , name: 'Cart', component: Cart},

  // order
  { path: '/order', component: Order, name: 'Order' },
  { path: '/order-history', name: 'OrderHistory', component: OrderHistory },
  
  // review
  { path: '/reviewcreate', name: 'ReviewCreate', component: ReviewCreate },
  { path: '/reviewlist', name: 'ReviewList', component: ReviewList },

  // inquiry
  { path: '/inquiries', component: Inquirylist },
  { path: '/inquiries/create', component: InquiryCreate, meta: { requiresAuth: true } }, // 인증 필요
  { path: '/inquiries/:id', name: 'InquiryDetail', component: InquiryDetail, props: true },



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
