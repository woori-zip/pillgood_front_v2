import { createRouter, createWebHistory } from 'vue-router';
import AdminDashboard from '../views/admin/AdminDashboard.vue';
import AdminMemberList from '../views/admin/AdminMemberList.vue';
import AdminProductList from '../views/admin/AdminProductList.vue';
import AdminNoticeList from '../views/admin/AdminNoticeList.vue';
import AdminReviewList from '../views/admin/AdminReviewList.vue';
import AdminInquiryList from '../views/admin/AdminInquiryList.vue';
import AdminCouponList from '../views/admin/AdminCouponList.vue';
import AdminSurveyList from '../views/admin/AdminSurveyManagement.vue';

import store from '../store';



const routes = [
    { path: '/admin', component: AdminDashboard },
    { path: '/admin/members', component: AdminMemberList },
    { path: '/admin/products', component: AdminProductList },
    { path: '/admin/notices', component: AdminNoticeList },
    { path: '/admin/reviews', component: AdminReviewList },
    { path: '/admin/inquirys', component: AdminInquiryList },
    { path: '/admin/coupons', component: AdminCouponList },
    { path: '/admin/surveys', component: AdminSurveyList },
    { path: '/:pathMatch(.*)*', redirect: '/admin' }
  ];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const loggedIn = store.state.member?.isLoggedIn;

  if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router;
