import { createStore } from 'vuex';
import home from './modules/homeStore'
import member from './modules/memberStore';
import nutrient from './modules/nutrientStore';
import product from './modules/productStore';
import survey from './modules/surveyStore';
import adminSurvey from './modules/adminSurveyStore';
import cart from './modules/cartStore';
import order from './modules/orderStore';
import billing from './modules/billingStore';

import review from './modules/reviewStore';
import deficiency from './modules/deficiencyStore';
import efficiency from './modules/efficiencyStore';
import refund from './modules/refunds';

import inquiry from './modules/inquiryStore';
import coupon from './modules/couponStore';
import shipping from './modules/shippingStore';

import detailedquestion from './modules/detailedquestion';

import subscriptions from './modules/subscriptions'

import point from './modules/pointStore';

import notice from './modules/notice';

export default createStore({
  modules: {
    member,
    nutrient,
    product,
    survey,
    cart,
    order,
    review,
    deficiency,
    efficiency,
    notice,
    inquiry,
    coupon,
    home,
    refund,
    billing,
    shipping,
    adminSurvey,
    detailedquestion,
    point,
    subscriptions
  }
});
