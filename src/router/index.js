// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/HomeView.vue';
import Register from '../views/RegisterMember.vue';
import Login from '../views/LoginView.vue';
import ForgotPassword from '../views/ForgotPasswordView.vue';
import ChangePassword from '../views/ChangePasswordView.vue';
import RefundCreate from '../views/RefundCreate.vue';
import RefundDetail from '../views/RefundDetail.vue';
import RefundList from '../views/RefundList.vue'; // 추가된 import

// member
import MemberList from '../views/MemberList.vue';
import MemberEdit from '../views/MemberEdit.vue';
import MyPage from '../views/MyPage.vue';
import ShippingAddressManager from '../views/ShippingAddressManager.vue';

// product
import ProductCreate from '../views/product/ProductCreate.vue';
// import AdminProductList from '../views/product/ProductList.vue';
import ProductList from '../views/ProductList.vue';
import ProductEdit from '../views/product/ProductEdit.vue';
import ProductDetail from '../views/ProductDetail.vue';
import NutrientEdit from '../views/product/NutrientEdit.vue';

// notice
import NoticeList from '../views/NoticeList.vue';
import NoticeCreate from '../views/NoticeCreate.vue';
import NoticeEdit from '../views/NoticeEdit.vue';
import NoticeDetail from '../views/NoticeDetail.vue';

// survey
import Survey from '../views/SurveyPage.vue';
import SurveyResult from '../views/SurveyResultView.vue';

// cart
import Cart from '../views/CartPage.vue';

// order
import Order from '../views/OrderPage.vue';
import OrderHistory from '../views/OrderHistory.vue';
import OrderDetail from '../views/OrderDetail.vue';
import PaymentSuccess from '../views/PaymentSuccess.vue';

import BillingSuccess from '../views/BillingSuccess.vue';
import PaymentFail from '../views/PaymentFail.vue'
import CardRegistration from '../views/CardRegistration.vue'
import ApprovePayment from '../views/ApprovePayment.vue'
import CancelPayment from '../views/CancelPayment.vue';
import CancelSuccess from '../views/CancelSuccess.vue';

// coupon
import MyCoupon from '../views/MyCoupon.vue';

// review
import ReviewCreate from '../views/ReviewCreate.vue';
import ReviewList from '../views/ReviewList.vue';
import ReviewDetail from '../views/ReviewDetail.vue';

// inquiry
import InquiryList from '../views/InquiryPage.vue';
import InquiryCreate from '../views/InquiryCreate.vue';
import InquiryDetail from '../views/InquiryDetail.vue';
import MyInquiries from '../views/MyInquiries.vue';

// subscriptions
import MySubscriptions from '../views/MySubscriptions.vue';
// import CancelSubscriptions from '../views/CancelSubscriptions.vue';

// point
import MyPoints from '../views/MyPoints.vue';


import store from '../store';

const routes = [
  { path: '/', component: Home },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  { path: '/forgotpassword', component: ForgotPassword },
  { path: '/changepassword', component: ChangePassword },
  { path: '/mypage', component: MyPage, meta: { requiresAuth: true } },
  { path: '/memberlist', component: MemberList },
  { path: '/memberedit', component: MemberEdit },

  // product
  { path: '/productcreate', component: ProductCreate, meta: { requiresAuth: true } },
  // { path: '/admin/productlist', component: AdminProductList },
  { path: '/productedit/:id', name: 'ProductEdit', component: ProductEdit, props: true },
  { path: '/productlist', name:'ProductList', component: ProductList },
  { path: '/product/:id', name: 'ProductDetail', component: ProductDetail, props: true },
  { path: '/nutrientedit', component: NutrientEdit },

  // notice
  { path: '/noticelist', name: 'NoticeList', component: NoticeList },
  { path: '/noticecreate', name: 'NoticeCreate', component: NoticeCreate, meta: { requiresAuth: true } },
  { path: '/noticeedit/:id', name: 'NoticeEdit', component: NoticeEdit, props: true, meta: { requiresAuth: true } },
  { path: '/noticedetail/:id', name: 'NoticeDetail', component: NoticeDetail, props: true },

  // survey
  { path: '/surveyresult/:memberId', name: 'SurveyResult', component: SurveyResult },
  { path: '/survey', name: 'Survey', component: Survey, meta: { requiresAuth: true } },

  // cart
  { path: '/cart', name: 'Cart', component: Cart },

  // order
  { path: '/order', component: Order, name: 'Order' },
  { path: '/order-history', name: 'OrderHistory', component: OrderHistory },
  { path: '/order-detail/:orderNo', name: 'OrderDetail', component: OrderDetail, props: true }, // 수정된 부분

  { path: '/payment/success', name: 'PaymentSuccess', component: PaymentSuccess },
  { path: '/payment/billingsuccess', name: 'BillingSuccess', component: BillingSuccess },
  { path: '/payment/fail', name: 'PaymentFail', component: PaymentFail },
  { path: '/payment/card', name: 'CardRegistration', component: CardRegistration },
  { path: '/payment/approve', name: 'ApprovePayment', component: ApprovePayment },
  { path: '/cancel-payment/:orderNo', name: 'CancelPayment', component: CancelPayment },
  { path: '/payment/cancel-success', name: 'CancelSuccess', component: CancelSuccess },

  // return
  { path: '/refundcreate', name: 'RefundCreate', component: RefundCreate },
  { path: '/refunddetail/:orderNo', name: 'RefundDetail', component: RefundDetail, props: true },
  { path: '/refundlist', name: 'RefundList', component: RefundList },

  // review
  { path: '/reviewcreate', name: 'ReviewCreate', component: ReviewCreate },
  { path: '/reviewlist', name: 'ReviewList', component: ReviewList },
  { path: '/reviewdetail', name: 'ReviewDetail', component: ReviewDetail },

  { path: '/mycoupon', name: 'MyCoupon', component: MyCoupon },
  { path: '/myaddress', name: 'ShippingAddressManager', component: ShippingAddressManager },

  // inquiry
  { path: '/inquiries', component: InquiryList },
  { path: '/inquiries/create', component: InquiryCreate, meta: { requiresAuth: true } },
  { path: '/inquiries/:id', name: 'InquiryDetail', component: InquiryDetail, props: true },
  { path: '/myinquiries', name: 'MyInquiries', component: MyInquiries },

  // subscriptions
  { path: '/mysubscriptions', name: 'MySubscriptions', component: MySubscriptions },
  // { path: '/cancel-subscription/:memberId', name: 'CancelSubscriptions', component: CancelSubscriptions, props: true },

  // point
  { path: '/mypoints', name: 'MyPoints', component: MyPoints },

];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// 라우터 가드 설정
router.beforeEach((to, from, next) => {
  console.log('store:', store); // 스토어 로그 출력
  const loggedIn = store.state.member?.isLoggedIn;

  if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router;
