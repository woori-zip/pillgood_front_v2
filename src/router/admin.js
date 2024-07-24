import { createRouter, createWebHistory } from 'vue-router';
import AdminDashboard from '../views/admin/AdminDashboard.vue';
import AdminMemberList from '../views/admin/AdminMemberList.vue';
import AdminProductList from '../views/admin/AdminProductList.vue';
import AdminNoticeList from '../views/admin/AdminNoticeList.vue';
import AdminReviewList from '../views/admin/AdminReviewList.vue';
import AdminInquiryList from '../views/admin/AdminInquiryList.vue';
import AdminCouponList from '../views/admin/AdminCouponList.vue';
import AdminSurveyList from '../views/admin/AdminSurveyManagement.vue';
import AdminDetailedQuestionManagement from '../views/admin/AdminDetailedQuestionManagement.vue';
import Home from '../views/HomeView.vue'; // 홈 컴포넌트 임포트

import store from '../store';

const routes = [
    { path: '/', component: Home },
    { path: '/admin', component: AdminDashboard, meta: { requiresAdmin: true } },
    { path: '/admin/members', component: AdminMemberList, meta: { requiresAdmin: true } },
    { path: '/admin/products', component: AdminProductList, meta: { requiresAdmin: true } },
    { path: '/admin/notices', component: AdminNoticeList, meta: { requiresAdmin: true } },
    { path: '/admin/reviews', component: AdminReviewList, meta: { requiresAdmin: true } },
    { path: '/admin/inquirys', component: AdminInquiryList, meta: { requiresAdmin: true } },
    { path: '/admin/coupons', component: AdminCouponList, meta: { requiresAdmin: true } },
    { path: '/admin/surveys', component: AdminSurveyList, meta: { requiresAdmin: true } },
    { path: '/admin/detailedquestion', component: AdminDetailedQuestionManagement, meta: { requiresAdmin: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const loggedIn = store.state.member?.isLoggedIn;
  const isAdmin = store.state.member?.isAdmin;

  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!loggedIn || !isAdmin) {
      next(window.location.href = '/');  // 홈 페이지로 리디렉션
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
