import { createStore } from 'vuex';
import member from './modules/memberStore';
import nutrient from './modules/nutrientStore';
import product from './modules/productStore';
import survey from './modules/surveyStore';
import cart from './modules/cartStore';
import review from './modules/reviewStore';
import deficiency from './modules/deficiencyStore';
import efficiency from './modules/efficiencyStore';


import notice from './modules/notice';

export default createStore({
  modules: {
    member,
    nutrient,
    product,
    survey,
    cart,
    review,
    deficiency,
    notice,
    efficiency
  }
});
