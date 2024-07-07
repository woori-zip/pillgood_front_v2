import { createStore } from 'vuex';
import member from './modules/memberStore';
import nutrient from './modules/nutrientStore';
import product from './modules/productStore';
import survey from './modules/surveyStore';
import cart from './modules/cartStore';
import order from './modules/orderStore';

import notice from './modules/notice';

export default createStore({
  modules: {
    member,
    nutrient,
    product,
    survey,
    cart,
    notice,
    order
  }
});
