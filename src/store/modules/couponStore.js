import axios from '../../axios';

const state = {
  coupons: [],
  activeCoupons: [],
};

const getters = {
  allCoupons: (state) => state.coupons,
  activeCoupons: (state) => state.activeCoupons,
};

const actions = {
  async fetchCoupons({ commit }) {
    console.log('쿠폰 요청 시작'); // 요청 시작 로그
    try {
      const response = await axios.get('/api/coupons/list');
      console.log('쿠폰 컨트롤러 응답:', response.data); // 응답 로그
      commit('setCoupons', response.data);
    } catch (error) {
      console.error('쿠폰 요청 실패:', error); // 실패 로그
    }
  },
  async fetchActiveCoupons({ commit }) {
    console.log('활성 쿠폰 요청 시작'); // 요청 시작 로그
    try {
      const response = await axios.get('/api/coupons/list');
      console.log('활성 쿠폰 컨트롤러 응답:', response.data); // 응답 로그
      const activeCoupons = response.data.filter(coupon => coupon.couponStatus === 'T'); // 필터링 적용
      commit('setActiveCoupons', activeCoupons);
    } catch (error) {
      console.error('활성 쿠폰 요청 실패:', error); // 실패 로그
    }
  },
  async createOwnedCoupon({ commit, state }, { memberUniqueId, couponId }) {
    console.log('쿠폰 발급 요청 시작'); // 요청 시작 로그
    const coupon = state.activeCoupons.find(coupon => coupon.couponId === couponId);

    if (!coupon) {
      throw new Error('쿠폰을 찾을 수 없습니다.');
    }

    const issuedDate = new Date().toISOString();
    const expiryDate = new Date(new Date().setDate(
      new Date().getDate() + coupon.validityPeriod)
      ).toISOString(); // 발급날짜 + 유효기간

    const ownedCoupon = {
      memberUniqueId,
      couponId,
      couponUsed: false, // 기본값 설정
      issuedDate,
      expiryDate
    };

    console.log('최종 전송 데이터:', ownedCoupon); // 최종 데이터 로그

    try {
      const response = await axios.post('/admin/ownedcoupons/create', ownedCoupon, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // 인증 토큰 추가
        }
      });
      console.log('쿠폰 발급 응답:', response.data); // 응답 로그
      commit('addOwnedCoupon', response.data);
    } catch (error) {
      console.error('쿠폰 발급 실패:', error); // 실패 로그
      throw error;
    }
  },
  async createCoupon({ commit }, coupon) {
    try {
      const response = await axios.post('/admin/coupons/create', coupon);
      commit('newCoupon', response.data);
    } catch (error) {
      console.error('쿠폰 생성 실패:', error);
    }
  },
  async updateCoupon({ commit }, updatedCoupon) {
    try {
      const response = await axios.put(`/admin/coupons/${updatedCoupon.couponId}`, updatedCoupon);
      commit('updateCoupon', response.data);
    } catch (error) {
      console.error('쿠폰 업데이트 실패:', error);
    }
  },
  async deleteCoupon({ commit }, couponId) {
    try {
      await axios.delete(`/admin/coupons/${couponId}`);
      commit('removeCoupon', couponId);
    } catch (error) {
      console.error('쿠폰 삭제 실패:', error);
    }
  },
};

const mutations = {
  setCoupons: (state, coupons) => {
    console.log('setCoupons 호출:', coupons); // 커밋 로그
    state.coupons = coupons;
  },
  setActiveCoupons: (state, activeCoupons) => {
    console.log('setActiveCoupons 호출:', activeCoupons); // 커밋 로그
    state.activeCoupons = activeCoupons;
  },
  addOwnedCoupon: (state, ownedCoupon) => {
    console.log('addOwnedCoupon 호출:', ownedCoupon); // 커밋 로그
    // 필요한 경우, 상태를 업데이트
  },
  newCoupon: (state, coupon) => state.coupons.push(coupon),
  updateCoupon: (state, updatedCoupon) => {
    const index = state.coupons.findIndex(coupon => coupon.couponId === updatedCoupon.couponId);
    if (index !== -1) {
      state.coupons.splice(index, 1, updatedCoupon);
    }
  },
  removeCoupon: (state, couponId) => {
    state.coupons = state.coupons.filter(coupon => coupon.couponId !== couponId);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
